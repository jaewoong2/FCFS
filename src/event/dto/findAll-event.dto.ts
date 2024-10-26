import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindAllEventDto {
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly startDate?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly endDate?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly description?: string;

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
