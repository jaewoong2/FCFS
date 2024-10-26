import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FindAllGifticonDto {
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  limit?: number = 10;
}
