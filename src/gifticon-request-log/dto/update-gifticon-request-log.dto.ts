import { PartialType } from '@nestjs/swagger';
import { CreateGifticonRequestLogDto } from './create-gifticon-request-log.dto';

export class UpdateGifticonRequestLogDto extends PartialType(CreateGifticonRequestLogDto) {}
