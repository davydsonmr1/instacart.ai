import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutService,
    private readonly ai: AiService,
  ) {}

  @Post()
  @HttpCode(200)
  async validate(@Body() dto: CheckoutDto) {
    const result = await this.checkout.validate(dto);
    const message = await this.ai.generateOrderMessage(result);

    const whatsappUrl = result.store.whatsapp
      ? `https://wa.me/${result.store.whatsapp}?text=${encodeURIComponent(message)}`
      : null;

    return { ...result, message, whatsappUrl };
  }
}
