import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetStatusEventDto {
  @Type(() => Number)
  @IsNumber()
  readonly eventId: number;

  @Type(() => Number)
  @IsNumber()
  readonly userId: number;
}
