import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { SqsService } from 'src/sqs/sqs.service';
import { Participant } from './entities/participant.entity';
import { z } from 'zod';
import { Message } from './types';
import { getYYYYMMDDhhmm } from 'src/core/utils/date';
import { PostApplyEventDto } from './dto/apply-event.dto';
import {
  AlereadyExistException,
  AuthroizationException,
  EntityNotFoundException,
  ValidatationErrorException,
} from 'src/core/filters/exception/service.exception';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventDto } from './dto/findAll-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

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

  async deleteEvent(eventId: number) {
    const event = await this.findEvent(eventId);

    if (!event) {
      throw EntityNotFoundException(`Event 가 없습니다. EventId: ${eventId}`);
    }

    return await this.eventRepository.softDelete(eventId);
  }

  async updateEvent(
    eventId: number,
    updateValue: UpdateEventDto | null,
    callback?: (event: Event) => Event,
  ): Promise<Event> {
    const event = await this.findEvent(eventId);

    // 날짜 유효성 검사: eventStartDate가 eventEndDate보다 이후일 수 없음
    if (
      updateValue?.eventStartDate &&
      updateValue?.eventEndDate &&
      new Date(updateValue?.eventStartDate) >
        new Date(updateValue?.eventEndDate)
    ) {
      throw ValidatationErrorException('Start date cannot be after end date');
    }

    // 선택적 업데이트: 각 필드가 주어졌을 때만 업데이트
    if (updateValue?.eventName) {
      event.eventName = updateValue?.eventName;
    }
    if (updateValue?.eventStartDate) {
      event.eventStartDate = updateValue?.eventStartDate;
    }
    if (updateValue?.eventEndDate) {
      event.eventEndDate = updateValue?.eventEndDate;
    }
    if (updateValue?.maxParticipants) {
      event.maxParticipants = updateValue?.maxParticipants;
    }

    if (updateValue?.eventDescription) {
      event.eventDescription = updateValue?.eventDescription;
    }

    if (updateValue?.totalGifticons) {
      event.totalGifticons = updateValue?.totalGifticons;
    }

    if (callback) {
      const newEvent = callback(event);
      event.eventDescription = newEvent.eventDescription;
      event.eventName = newEvent.eventName;
      event.eventStartDate = newEvent.eventEndDate;
      event.maxParticipants = newEvent.maxParticipants;
      event.totalGifticons = newEvent.totalGifticons;
    }

    // 변경사항 저장
    return this.eventRepository.save(event);
  }

  async findEvent(
    eventId: number,
    eventName?: string,
    options?: Omit<FindOneOptions<Event>, 'where'>,
  ) {
    const event = await this.eventRepository.findOne({
      where: [{ id: eventId }, { eventName: eventName }],
      ...options,
    });

    if (!event) {
      throw EntityNotFoundException(`Event 가 없습니다. EventId: ${eventId}`);
    }

    return event;
  }

  async findAllEvent({
    endDate,
    startDate,
    name,
    description,
    page = 1,
    limit = 10,
  }: FindAllEventDto) {
    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    if (name) {
      queryBuilder.andWhere('LOWER(event.eventName) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (description) {
      queryBuilder.andWhere('event.eventDescription LIKE :description', {
        description: `%${description}%`,
      });
    }

    // 날짜 필터링
    if (startDate) {
      queryBuilder.andWhere('event.eventEndDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('event.eventStartDate <= :endDate', { endDate });
    }

    // 유효성 검사: endDate가 startDate보다 앞서면 에러 발생
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    // Pagination 설정
    queryBuilder.skip((page - 1) * limit).take(limit);

    // 정렬: eventDate를 기준으로 오름차순
    queryBuilder.orderBy('event.eventStartDate', 'ASC');

    // 쿼리 실행
    const [result, total] = await queryBuilder.getManyAndCount();

    // 페이징된 결과 반환
    return {
      data: result,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async createEvent({
    eventEndDate,
    eventName,
    eventStartDate,
    eventDescription,
    totalGifticons,
    maxParticipants,
    userId,
  }: CreateEventDto) {
    const event = await this.eventRepository.findOne({
      where: { eventName: `${eventName}` },
    });

    if (event) {
      throw AlereadyExistException(`${eventName}은 이미 존재 합니다.`);
    }

    if (
      eventStartDate &&
      eventEndDate &&
      new Date(eventStartDate) > new Date(eventEndDate)
    ) {
      throw ValidatationErrorException('startDate cannot be after endDate');
    }

    const newEvent = this.eventRepository.create({
      eventEndDate,
      eventName,
      eventStartDate,
      maxParticipants,
      totalGifticons,
      eventDescription,
      user: { id: userId },
    });
    const result = await this.eventRepository.save(newEvent);

    return result;
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

  async isOwnerOfEvent(userId: number, eventId: number) {
    const event = await this.findEvent(eventId, null, {
      relations: ['user'],
      select: ['user'],
    });

    if (!event)
      if (event?.user?.id !== userId) {
        throw AuthroizationException('이벤트를 등록한 등록자가 아닙니다.');
      }

    return true;
  }
}
