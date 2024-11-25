import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindEventDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly eventId?: number;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly eventName?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly userName?: string;
}
