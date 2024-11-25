import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/core/types/pagination-post.dto';

export class FindAllEventDto extends PageOptionsDto {
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  readonly startDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  readonly endDate?: Date;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly description?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly userName?: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly status?: 'UPCOMING' | 'ONGOING' | 'FINISHED';
}
