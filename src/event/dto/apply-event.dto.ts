import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class PostApplyEventDto {
  @Type(() => Number)
  @IsNumber()
  readonly eventId: number;

  @Type(() => Number)
  @IsNumber()
  readonly userId: number;
}
