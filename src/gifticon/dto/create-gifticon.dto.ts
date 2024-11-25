import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GifticonCategory } from '../enums/gifticon-category.enum';

export class CreateGifticonDto {
  @Type(() => String)
  @IsString()
  readonly name: string;

  @Type(() => String)
  @IsString()
  readonly description: string;

  @Type(() => String)
  @IsString()
  readonly imageUrl: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly message?: string;

  @IsEnum(GifticonCategory)
  category: GifticonCategory;

  @Type(() => Number)
  @IsNumber()
  readonly eventId: number;
}
