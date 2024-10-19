import { Injectable } from '@nestjs/common';
import { CreateGiftconDto } from './dto/create-giftcon.dto';
import { UpdateGiftconDto } from './dto/update-giftcon.dto';

@Injectable()
export class GiftconService {
  create(createGiftconDto: CreateGiftconDto) {
    return 'This action adds a new giftcon';
  }

  findAll() {
    return `This action returns all giftcon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} giftcon`;
  }

  update(id: number, updateGiftconDto: UpdateGiftconDto) {
    return `This action updates a #${id} giftcon`;
  }

  remove(id: number) {
    return `This action removes a #${id} giftcon`;
  }
}
