import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class GetStatusDto {
  @Type(() => Number)
  @IsNumber()
  readonly eventId: number;
}
