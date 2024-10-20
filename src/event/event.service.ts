import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Gifticon)
    private readonly gifitconRepository: Repository<Gifticon>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async getStatus(eventId: number) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    const claimed = await this.gifitconRepository.count({
      where: { isClaimed: true, event: { id: eventId } },
    });

    if (event.maxParticipants <= claimed) {
      return {
        isAvailable: false,
        message: '기프티콘 발급이 불가능 합니다 (선착순 인원 참여 완료)',
      };
    }

    return {
      isAvailable: true,
      message: '기프티콘 발급이 가능 합니다',
    };
  }
}
