import { PartialType } from '@nestjs/swagger';
import { CreateGiftconDto } from './create-gifticon.dto';

export class UpdateGiftconDto extends PartialType(CreateGiftconDto) {}
