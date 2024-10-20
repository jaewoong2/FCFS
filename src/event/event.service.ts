import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { PostApplyEventDto } from './dto/apply-event.dto';
import { SqsService } from 'src/sqs/sqs.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Gifticon)
    private readonly gifitconRepository: Repository<Gifticon>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    private readonly sqsService: SqsService,
  ) {}

  async getStatus(eventId: number) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });
      const claimed = await this.gifitconRepository.count({
        where: { isClaimed: true, event: { id: eventId } },
      });

      if (event.maxParticipants <= claimed) {
        return {
          isAvailable: false,
          message: '이벤트 참여 종료 되었습니다.',
        };
      }

      return {
        isAvailable: true,
        message: '이벤트 참여 가능 합니다.',
      };
    } catch (err) {
      return {
        err: err,
        isAvailable: false,
        message: '이벤트 참여 실패 되었습니다.',
      };
    }
  }

  async applyEvent({ eventId, userId }: PostApplyEventDto) {
    try {
      const result = await this.sqsService.sendMessage({ eventId, userId });
      const error = result.$response.error;

      if (error) {
        throw error;
      }

      return {
        response: result,
        status: '성공',
        message: '이벤트 참여 신청 되었습니다.',
      };
    } catch (err) {
      return {
        err: err,
        status: '실패',
        message: '이벤트 참여 실패 되었습니다.',
      };
    }
  }
}
