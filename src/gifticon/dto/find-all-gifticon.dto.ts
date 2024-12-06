import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PageOptionsDto } from 'src/core/types/pagination-post.dto';

export class FindAllGifticonDto extends PageOptionsDto {
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

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly claimedBy?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly eventId?: number;

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
