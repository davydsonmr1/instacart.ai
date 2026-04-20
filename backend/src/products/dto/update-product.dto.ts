import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value.replace(',', '.')) : value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price?: number;
}
