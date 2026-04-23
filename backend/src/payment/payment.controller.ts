import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBody,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { AuthenticatedUser } from '../auth/supabase-auth.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  /**
   * Gera um link de checkout do Stripe para assinatura Premium.
   * Protegido por JWT — apenas lojistas autenticados.
   */
  @Post('create-checkout')
  @UseGuards(SupabaseAuthGuard)
  async createCheckout(@CurrentUser() user: AuthenticatedUser) {
    // As URLs de retorno apontam para o painel admin
    const origin = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const successUrl = `${origin}/admin?upgrade=success`;
    const cancelUrl = `${origin}/admin?upgrade=cancelled`;

    const url = await this.payment.createCheckoutSession(
      user.id,
      successUrl,
      cancelUrl,
    );

    return { url };
  }

  /**
   * Webhook do Stripe — rota pública (sem AuthGuard).
   * Valida a assinatura criptográfica do Stripe via header `Stripe-Signature`.
   * Requer `rawBody: true` no NestFactory.create.
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe-Signature header');
    }

    const ok = await this.payment.handleWebhook(rawBody, signature);
    if (!ok) {
      throw new BadRequestException('Webhook processing failed');
    }

    return { received: true };
  }
}
