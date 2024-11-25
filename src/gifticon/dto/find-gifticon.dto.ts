import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class FindGifticonDto {
  @Type(() => String)
  @IsString()
  readonly name: string;

  @Type(() => Number)
  @IsNumber()
  readonly id: number;
}
