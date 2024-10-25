import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { SqsService } from 'src/sqs/sqs.service';
import { Participant } from './entities/participant.entity';
import { z } from 'zod';
import { Message } from './types';
import { getYYYYMMDDhhmm } from 'src/core/utils/date';
import { PostApplyEventDto } from './dto/apply-event.dto';
import { EntityNotFoundException } from 'src/core/filters/exception/service.exception';

// Define Zod schema for PostApplyEventDto
const PostApplyEventSchema = z.object({
  eventId: z.number().positive(),
  userId: z.number().positive(),
  timestamp: z.string(),
});

@Injectable()
export class EventService {
  messasgeGroupId: string;
  constructor(
    @InjectRepository(Gifticon)
    private readonly gifitconRepository: Repository<Gifticon>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Participant)
    private readonly participatnRepository: Repository<Participant>,

    private readonly sqsService: SqsService,
  ) {
    this.messasgeGroupId = 'FCFS';
  }

  async isAvailable({ eventId, userId }: PostApplyEventDto) {
    const participant = await this.participatnRepository.findOne({
      where: [
        { event: { id: eventId }, user: { id: userId }, isApply: true },
        { event: { id: eventId }, user: { id: userId }, gifticonIssued: true },
      ],
      select: ['id'],
    });

    if (participant && participant?.id) {
      return {
        isAvailable: false,
        message: '이미 참여 완료 하였습니다.',
        userId,
      };
    }

    return {
      isAvailable: true,
      message: '이벤트 참여가 가능 합니다.',
      userId,
    };
  }

  async findEventsParticipants(eventId: number) {
    const [participants, count] = await this.participatnRepository.findAndCount(
      {
        where: { event: { id: eventId }, isApply: true },
      },
    );

    return { participants, count };
  }

  async getStatus(eventId: number) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
      });

      const claimed = await this.gifitconRepository.count({
        where: [{ event: { id: eventId }, isClaimed: true }],
      });

      const participants = await this.findEventsParticipants(event.id);

      if (
        event.totalGifticons <= claimed ||
        event.maxParticipants <= participants.count
      ) {
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

  async participate({ eventId, userId }: PostApplyEventDto) {
    await this.sendMessage({ eventId, userId });

    const receiveResult = await this.receiveMatchingMessage(eventId, userId);

    if (!receiveResult) {
      throw EntityNotFoundException('SQS Queue Message 가 존재 하지 않습니다.');
    }

    await this.sqsService.deleteMessage(receiveResult.ReceiptHandle);

    const participantsCount = await this.participatnRepository.findAndCount({
      where: { event: { id: eventId }, isApply: true },
    });

    const { maxParticipants } = await this.eventRepository.findOne({
      where: { id: eventId },
      select: ['maxParticipants'],
    });

    if (maxParticipants <= participantsCount[1]) {
      return {
        drawable: false,
        message: '현재 참여자가 몰려 있습니다, 조금 후에 참여 해주세요.',
        userId: userId,
      };
    }

    const participant = await this.findOrCreateParticipantNoTransaction(
      eventId,
      userId,
    );

    try {
      participant.isApply = true;
      await this.participatnRepository.save(participant);
    } catch (err) {
      participant.isApply = false;
      await this.participatnRepository.save(participant);
      throw err;
    }

    return {
      drawable: true,
      message: '참여 완료 하였습니다.',
      userId: userId,
    };
  }

  async drawParticipant({ eventId, userId }: Partial<Message>) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    const participant = await this.participatnRepository.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });

    const winners = await this.participatnRepository.count({
      where: {
        event: { id: eventId },
        gifticonIssued: true,
      },
    });

    if (winners >= event.totalGifticons) {
      participant.isApply = false;
      await this.participatnRepository.save(participant);

      return {
        message: '기프티콘이 모두 소진 되었습니다.',
        userId: userId,
        gifticon: null,
      };
    }

    const isWinner = await this.getWinner();

    participant.isApply = false;
    participant.gifticonIssued = isWinner ? true : false;

    await this.participatnRepository.save(participant);

    if (isWinner) {
      return {
        message: '당첨 되었습니다!',
        userId: userId,
        gifticon: {
          image: '',
          name: '',
        },
      };
    }

    return {
      message: '꽝! 다음 기회에...',
      userId: userId,
      gifticon: null,
    };
  }

  private async getWinner() {
    return new Promise((resolve) => {
      resolve(Math.ceil(Math.random() * 10) > 5);
    });
  }

  private async findOrCreateParticipantNoTransaction(
    eventId: number,
    userId: number,
  ) {
    const participant = await this.participatnRepository.findOne({
      where: { user: { id: userId }, event: { id: eventId } },
    });

    if (participant) {
      return participant;
    }

    return this.participatnRepository.create({
      event: { id: eventId },
      user: { id: userId },
      gifticonIssued: false,
      participatedAt: new Date(),
      isApply: true,
    });
  }

  private async sendMessage({ eventId, userId }: Omit<Message, 'timestamp'>) {
    try {
      await this.sqsService.sendMessage(
        { eventId, userId, timestamp: getYYYYMMDDhhmm() },
        {
          MessageGroupId: this.messasgeGroupId,
          MessageAttributes: {
            userId: {
              DataType: 'Number',
              StringValue: userId.toString(),
            },
            eventId: {
              DataType: 'Number',
              StringValue: eventId.toString(),
            },
          },
        },
      );
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  private async receiveMatchingMessage(eventId: number, userId: number) {
    const maxWaitTime = 30 * 1000; // 30 seconds
    const pollingInterval = 1000; // 1 second
    const endTime = Date.now() + maxWaitTime;

    while (Date.now() < endTime) {
      const result = await this.sqsService.receiveMessage({
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 0,
        WaitTimeSeconds: 10,
      });

      if (!result) {
        break;
      }

      for (const msg of result.Messages) {
        const msgUserId = msg.MessageAttributes?.userId?.StringValue;
        const msgEventId = msg.MessageAttributes?.eventId?.StringValue;

        if (Number(msgUserId) === userId && Number(msgEventId) === eventId) {
          try {
            const body = JSON.parse(msg.Body);
            const parsedBody = PostApplyEventSchema.parse(body);
            return {
              Message: parsedBody,
              ReceiptHandle: msg.ReceiptHandle,
            };
          } catch (error) {
            // Handle validation or parsing errors
            console.error('Invalid message format:', error);
            await this.sqsService.deleteMessage(msg.ReceiptHandle);
          }
        }
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }

    return null;
  }
}
