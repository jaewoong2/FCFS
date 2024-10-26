import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ClaimGifticonDto {
  @Type(() => Number)
  @IsNumber()
  readonly eventId: number;

  @Type(() => Number)
  @IsNumber()
  readonly userId: number;
}
