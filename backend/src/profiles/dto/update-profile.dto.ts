import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'slug deve conter apenas letras minúsculas, números e hífens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  store_name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const digits = value.replace(/\D/g, '');
    // Prefixar DDI Brasil (55) se o número tem apenas DDD + número (10-11 dígitos)
    return digits.length >= 10 && digits.length <= 11 ? `55${digits}` : digits;
  })
  @Matches(/^\d{10,15}$/, {
    message: 'whatsapp deve ter apenas dígitos (DDI + DDD + número, 10-15 dígitos)',
  })
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  bio?: string;
}
