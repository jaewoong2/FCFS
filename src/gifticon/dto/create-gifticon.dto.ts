import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

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

  @Type(() => Number)
  @IsNumber()
  readonly eventId: number;

  @Type(() => Number)
  @IsNumber()
  readonly userId: number;
}
