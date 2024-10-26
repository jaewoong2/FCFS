import { PartialType } from '@nestjs/swagger';
import { CreateGifticonDto } from './create-gifticon.dto';

export class UpdateGifticonDto extends PartialType(CreateGifticonDto) {}
