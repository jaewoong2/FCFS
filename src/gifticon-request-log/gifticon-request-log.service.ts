import { Injectable } from '@nestjs/common';
import { CreateGifticonRequestLogDto } from './dto/create-gifticon-request-log.dto';
import { UpdateGifticonRequestLogDto } from './dto/update-gifticon-request-log.dto';

@Injectable()
export class GifticonRequestLogService {
  create(createGifticonRequestLogDto: CreateGifticonRequestLogDto) {
    return 'This action adds a new gifticonRequestLog';
  }

  findAll() {
    return `This action returns all gifticonRequestLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gifticonRequestLog`;
  }

  update(id: number, updateGifticonRequestLogDto: UpdateGifticonRequestLogDto) {
    return `This action updates a #${id} gifticonRequestLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} gifticonRequestLog`;
  }
}
