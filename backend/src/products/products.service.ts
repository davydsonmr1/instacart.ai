import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface Product {
  id: string;
  user_id: string;
  name: string;
  price: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly bucket: string;

  constructor(
    private readonly supabase: SupabaseService,
    config: ConfigService,
  ) {
    this.bucket = config.get<string>('SUPABASE_STORAGE_BUCKET') ?? 'product-images';
  }

  async findAllByUser(userId: string): Promise<Product[]> {
    const { data, error } = await this.supabase.admin
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return (data ?? []) as Product[];
  }

  async findPublicByUserId(userId: string): Promise<Product[]> {
    const { data, error } = await this.supabase.admin
      .from('products')
      .select('id, name, price, image_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return (data ?? []) as Product[];
  }

  async create(
    userId: string,
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const image_url = file ? await this.uploadImage(userId, file) : null;

    const { data, error } = await this.supabase.admin
      .from('products')
      .insert({
        user_id: userId,
        name: dto.name,
        price: dto.price,
        image_url,
      })
      .select('*')
      .single();

    if (error) {
      this.logger.error(`create error: ${error.message}`);
      throw new BadRequestException(error.message);
    }
    return data as Product;
  }

  async update(
    userId: string,
    productId: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    // DECISÃO ARQUITETÔNICA DOC:
    // O backend atual utiliza `this.supabase.admin` (Service Role Key), ignorando o RLS.
    // Apesar disso, a segurança do tenant (BOLA) está preservada, pois este serviço realiza a
    // validação proativa (via `ensureOwnership` e cláusulas `.eq('user_id', userId)`).
    // As políticas RLS do supabase são úteis para segurança no cliente, mas como esse fluxo
    // passa sempre pela API, a checagem BOLA em nível de código é segura e aceitável 
    // caso as políticas completas de RLS do banco (UPDATE/DELETE) se tornem redundantes.
    
    await this.ensureOwnership(userId, productId);

    const patch: Partial<Product> = { ...dto };
    if (file) patch.image_url = await this.uploadImage(userId, file);

    const { data, error } = await this.supabase.admin
      .from('products')
      .update(patch)
      .eq('id', productId)
      .eq('user_id', userId) // BOLA defense dupla
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data as Product;
  }

  async remove(userId: string, productId: string): Promise<{ deleted: true }> {
    const product = await this.ensureOwnership(userId, productId);

    // Correção: Extrair path e remover do DB Storage antes de deletar a row no DB (evita Memory Leak)
    if (product.image_url) {
      try {
        const urlParts = product.image_url.split(`${this.bucket}/`);
        if (urlParts.length > 1) {
          const path = urlParts[1];
          await this.supabase.admin.storage.from(this.bucket).remove([path]);
          this.logger.log(`Deleted image from storage: ${path}`);
        }
      } catch (err: any) {
        this.logger.error(`Failed to delete image from storage: ${err.message}`);
      }
    }

    const { error } = await this.supabase.admin
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', userId); // BOLA defense dupla

    if (error) throw new BadRequestException(error.message);
    return { deleted: true };
  }

  private async ensureOwnership(userId: string, productId: string): Promise<Product> {
    const { data, error } = await this.supabase.admin
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) throw new BadRequestException(error.message);
    if (!data) throw new NotFoundException('Produto não encontrado');
    if (data.user_id !== userId) throw new ForbiddenException('Produto pertence a outro lojista');
    return data as Product;
  }

  private async uploadImage(userId: string, file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException(`Formato inválido. Use: ${ALLOWED_MIME.join(', ')}`);
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Imagem deve ter no máximo 5MB');
    }

    // Correção da extensão via mapeamento de MIME type ao invés de usar originalname que pode ser falso/ausente
    const mimeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/avif': '.avif',
    };
    const ext = mimeMap[file.mimetype] || extname(file.originalname || '').toLowerCase() || '.jpg';
    const path = `${userId}/${randomUUID()}${ext}`;

    const { error: uploadError } = await this.supabase.admin.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      this.logger.error(`upload error: ${uploadError.message}`);
      throw new BadRequestException(`Falha no upload: ${uploadError.message}`);
    }

    const { data } = this.supabase.admin.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
