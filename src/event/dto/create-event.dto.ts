import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @Type(() => Number)
  @IsNumber()
  readonly userId: number;

  @Type(() => Number)
  @IsNumber()
  readonly maxParticipants: number;

  @Type(() => Number)
  @IsNumber()
  readonly totalGifticons: number;

  @Type(() => String)
  @IsString()
  readonly eventName: string;

  @Type(() => String)
  @IsString()
  readonly eventDescription: string;

  @Type(() => Date)
  @IsDate()
  readonly eventStartDate: Date;

  @Type(() => Date)
  @IsDate()
  readonly eventEndDate: Date;
}
