import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  items: OrderItem[];
  status: string;
  created_at: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async findByUser(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabase.admin
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`findByUser error: ${error.message}`);
      return [];
    }
    return (data ?? []) as Order[];
  }
}
