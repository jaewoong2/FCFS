import { PartialType } from '@nestjs/swagger';
import { CreateGiftconDto } from './create-giftcon.dto';

export class UpdateGiftconDto extends PartialType(CreateGiftconDto) {}
