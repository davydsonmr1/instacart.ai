import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from '../ai/ai.service';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly ai: AiService,
  ) {}

  /**
   * 3 chamadas por IP a cada 60s. O endpoint dispara IA (custo $),
   * por isso o limite é intencionalmente severo.
   */
  @Post()
  @HttpCode(200)
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  async validate(@Body() dto: CheckoutDto) {
    const result = await this.checkout.validate(dto);
    const message = await this.ai.generateOrderMessage(result);

    const whatsappUrl = result.store.whatsapp
      ? `https://wa.me/${result.store.whatsapp}?text=${encodeURIComponent(message)}`
      : null;

    return { ...result, message, whatsappUrl };
  }
}
