import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post()
  @HttpCode(200)
  async validate(@Body() dto: CheckoutDto) {
    return this.checkout.validate(dto);
  }
}
