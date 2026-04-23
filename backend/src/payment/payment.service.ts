import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly webhookSecret: string;
  private readonly priceId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    this.stripe = new Stripe(
      this.config.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
    this.webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    this.priceId = this.config.getOrThrow<string>('STRIPE_PRICE_ID');
  }

  /**
   * Cria uma sessão de Stripe Checkout para assinatura Premium.
   * O `client_reference_id` vincula a sessão ao `user_id` do Supabase.
   */
  async createCheckoutSession(
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: userId,
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      throw new Error('Stripe não retornou URL da sessão');
    }

    this.logger.log(`Checkout session created for user ${userId}: ${session.id}`);
    return session.url;
  }

  /**
   * Valida a assinatura do webhook e processa o evento.
   * Retorna true se processado com sucesso.
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<boolean> {
    let event: ReturnType<typeof this.stripe.webhooks.constructEvent>;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.warn(`Webhook signature verification failed: ${(err as Error).message}`);
      return false;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;

      if (!userId) {
        this.logger.warn('checkout.session.completed sem client_reference_id');
        return false;
      }

      const { error } = await this.supabase.admin
        .from('profiles')
        .update({ plan: 'premium' })
        .eq('id', userId);

      if (error) {
        this.logger.error(`Falha ao atualizar plano: ${error.message}`);
        return false;
      }

      this.logger.log(`✅ Plano atualizado para premium: ${userId}`);
      return true;
    }

    // Evento não tratado — ignorar silenciosamente
    return true;
  }
}
