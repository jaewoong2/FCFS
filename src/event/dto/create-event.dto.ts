import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsJSON,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Block } from '../types';

export class CreateEventDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly userId?: number;

  @Type(() => Number)
  @IsNumber()
  readonly maxParticipants: number;

  @Type(() => Number)
  @IsNumber()
  readonly totalGifticons: number;

  @Type(() => String)
  @IsString()
  readonly eventName: string;

  @Type(() => Array)
  @IsArray()
  @IsOptional()
  readonly images: string[];

  @Type(() => String)
  @IsString()
  readonly eventDescription: string;

  @Type(() => Date)
  @IsDate()
  readonly eventStartDate: Date;

  @Type(() => Date)
  @IsDate()
  readonly eventEndDate: Date;

  @Type(() => Number)
  @IsNumber()
  repetition: number;

  @IsJSON()
  @IsOptional()
  blocks: Block[];
}
