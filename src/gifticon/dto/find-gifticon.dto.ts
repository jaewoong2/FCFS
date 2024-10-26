import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class FindGifticonDto {
  @Type(() => String)
  @IsString()
  readonly name: string;
}
