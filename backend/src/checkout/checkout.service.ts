import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CheckoutDto } from './dto/checkout.dto';

const FREE_PLAN_ITEM_LIMIT = 5;
const PREMIUM_PLAN_ITEM_LIMIT = 50;

export interface ResolvedItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutResult {
  items: ResolvedItem[];
  totalValue: number;
  currency: 'BRL';
  store: {
    id: string;
    slug: string;
    store_name: string;
    whatsapp: string | null;
  };
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async validate(dto: CheckoutDto): Promise<CheckoutResult> {
    const ids = [...new Set(dto.items.map((i) => i.productId))];
    if (ids.length !== dto.items.length) {
      throw new BadRequestException('Itens duplicados no payload');
    }

    const { data: products, error } = await this.supabase.admin
      .from('products')
      .select('id, user_id, name, price')
      .in('id', ids);

    if (error) {
      this.logger.error(`validate lookup error: ${error.message}`);
      throw new BadRequestException(error.message);
    }

    if (!products || products.length !== ids.length) {
      const found = new Set((products ?? []).map((p) => p.id));
      const missing = ids.filter((id) => !found.has(id));
      throw new BadRequestException(`Produtos inexistentes: ${missing.join(', ')}`);
    }

    const storeIds = new Set(products.map((p) => p.user_id));
    if (storeIds.size !== 1) {
      throw new BadRequestException('Todos os itens devem pertencer à mesma loja');
    }
    const storeUserId = [...storeIds][0];

    // Buscar perfil da loja (incluindo plan) para validação dinâmica
    const { data: store } = await this.supabase.admin
      .from('profiles')
      .select('id, slug, store_name, whatsapp, plan')
      .eq('id', storeUserId)
      .maybeSingle();

    if (!store) throw new NotFoundException('Loja não encontrada para os produtos informados');

    // Validação dinâmica de limite baseada no plano
    const limit = store.plan === 'premium' ? PREMIUM_PLAN_ITEM_LIMIT : FREE_PLAN_ITEM_LIMIT;
    if (dto.items.length > limit) {
      throw new BadRequestException(
        `Plano ${store.plan ?? 'free'}: máximo ${limit} itens distintos por pedido.`,
      );
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    let totalValue = 0;
    const resolved: ResolvedItem[] = dto.items.map((item) => {
      const prod = byId.get(item.productId)!;
      const unitPrice = Number(prod.price);
      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      totalValue = Math.round((totalValue + subtotal) * 100) / 100;
      return {
        productId: prod.id,
        name: prod.name,
        unitPrice,
        quantity: item.quantity,
        subtotal,
      };
    });

    // Registrar pedido no banco (Service Role bypassa RLS)
    const { error: orderError } = await this.supabase.admin
      .from('orders')
      .insert({
        user_id: storeUserId,
        total_amount: totalValue,
        items: resolved,
        status: 'pending',
      });

    if (orderError) {
      this.logger.error(`order insert error: ${orderError.message}`);
      // Não bloquear checkout por falha no registro — log e segue
    }

    return {
      items: resolved,
      totalValue,
      currency: 'BRL',
      store: {
        id: store.id,
        slug: store.slug,
        store_name: store.store_name,
        whatsapp: store.whatsapp,
      },
    };
  }
}
