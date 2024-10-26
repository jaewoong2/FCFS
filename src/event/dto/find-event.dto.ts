import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class FindEventDto {
  @Type(() => String)
  @IsString()
  readonly eventName: string;
}
