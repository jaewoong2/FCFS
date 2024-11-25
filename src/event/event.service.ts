import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import {
  EntityManager,
  FindOneOptions,
  In,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Event } from './entities/event.entity';
import { SqsService } from 'src/aws/sqs.service';
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
import { PageOptionsDto } from 'src/core/types/pagination-post.dto';
import { PageDto } from 'src/core/types/page.dto';
import { PageMetaDto } from 'src/core/types/page-meta.dto';
import { plainToInstance } from 'class-transformer';
import { GetEventResponseDto } from './dto/findAll-event-response.dto';
import { GetStatusEventDto } from './dto/get-status-event.dto';
import { v4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { FindEventDto } from './dto/find-event.dto';
import { Image } from 'src/images/entities/image.entity';
import { GifticonCategory } from 'src/gifticon/enums/gifticon-category.enum';

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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,

    private readonly sqsService: SqsService,
  ) {
    this.messasgeGroupId = 'FCFS';
  }

  async deleteEvent(eventId: number) {
    const event = await this.findEvent({ eventId });

    if (!event) {
      throw EntityNotFoundException(`Event 가 없습니다. EventId: ${eventId}`);
    }

    const result = await this.eventRepository.softRemove(event);

    return {
      message: '이벤트 삭제 성공 했습니다.',
      eventId: event.id,
      ...result,
    };
  }

  async updateEvent(
    eventId: number,
    updateValue: UpdateEventDto | null,
    callback?: (event: Event) => Event,
    manager?: EntityManager,
  ): Promise<Event> {
    const event = await this.findEvent({ eventId });

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

    if (updateValue?.images) {
      const image = await this.imageRepository.find({
        where: { imageUrl: In(updateValue?.images) },
      });

      image.forEach(async (img) => {
        img.event = event;

        const repository = manager
          ? manager.getRepository(Image)
          : this.imageRepository;

        await repository.save(img);
      });
    }

    if (callback) {
      const newEvent = callback(event);
      event.eventDescription = newEvent.eventDescription;
      event.eventName = newEvent.eventName;
      event.eventStartDate = newEvent.eventStartDate;
      event.eventEndDate = newEvent.eventEndDate;
      event.maxParticipants = newEvent.maxParticipants;
      event.totalGifticons = newEvent.totalGifticons;
    }

    const repository = manager
      ? manager.getRepository(Event)
      : this.eventRepository;

    // 변경사항 저장
    return repository.save(event);
  }

  async findEvent(
    query: FindEventDto,
    options?: Omit<FindOneOptions<Event>, 'where'>,
  ) {
    const event = await this.eventRepository.findOne({
      where: [
        { id: query.eventId },
        { eventName: decodeURIComponent(query.eventName) },
        { user: { userName: decodeURIComponent(query.userName) } },
      ],
      relations: [
        'participants',
        'user',
        'gifticons',
        'thumbnails',
        'gifticons.image',
      ],
      ...options,
    });

    if (!event) {
      throw EntityNotFoundException(`Event 가 없습니다.`);
    }

    return event;
  }

  async findAllEvent({
    endDate,
    startDate,
    name,
    description,
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

    queryBuilder.orderBy('event.eventStartDate', 'ASC');

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      total,
    };
  }

  async paginate(
    pageOptionsDto: Partial<PageOptionsDto>,
    attach?: <T>(qb: SelectQueryBuilder<T>) => SelectQueryBuilder<T>,
  ): Promise<PageDto<GetEventResponseDto>> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.thumbnails', 'thumbnails')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.gifticons', 'gifticons')
      .leftJoinAndSelect(
        'event.participants',
        'participants',
        'participants.isApply = :isApply',
        { isApply: true },
      );

    attach(qb)
      .orderBy('event.createdAt', 'DESC')
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    // 결과를 가져오기
    const [events, total] = await qb.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        skip: pageOptionsDto.skip,
        page: pageOptionsDto.page,
        take: pageOptionsDto.take,
      },
      total,
    });

    const last_page = pageMetaDto.last_page;

    const result = plainToInstance(GetEventResponseDto, events, {});

    if (result.length === 0) {
      return new PageDto(result, pageMetaDto);
    }

    if (last_page >= pageMetaDto.page) {
      return new PageDto(result, pageMetaDto);
    } else {
      throw EntityNotFoundException('해당 페이지는 존재하지 않습니다');
    }
  }

  async createEvent({
    eventEndDate,
    eventName,
    eventStartDate,
    eventDescription,
    totalGifticons,
    maxParticipants,
    images,
    userId,
    repetition,
  }: CreateEventDto) {
    const event = await this.eventRepository.findOne({
      where: { eventName: `${eventName}` },
    });
    const image = await this.imageRepository.find({
      where: { imageUrl: In(images) },
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
      repetition,
      user: { id: userId },
    });

    const result = await this.eventRepository.save(newEvent);

    await Promise.all(
      image.map(async (img) => {
        img.event = result;
        return this.imageRepository.save(img);
      }),
    );

    return { message: '이벤트생성 하였습니다', eventId: result.id };
  }

  async isAvailable({ eventId, userId }: PostApplyEventDto) {
    await this.findEvent({ eventId });

    const participant = await this.participatnRepository.findOne({
      where: [{ event: { id: eventId }, user: { id: userId }, isApply: true }],
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

  async getStatus({ eventId, userId }: GetStatusEventDto) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
        relations: ['gifticons'],
      });
      const user = await this.userRepository.findOne({
        where: { id: userId, claimedGifticons: { event: { id: eventId } } },
        relations: { claimedGifticons: true },
      });

      const totalGifticonsWithOutLose = event.gifticons.filter(
        ({ category }) => category !== 'LOSE',
      );

      const timeStatus = this.getTimeStatus(
        new Date(),
        event.eventStartDate,
        event.eventEndDate,
      );

      // 'ended' 상태인 경우 즉시 반환
      if (timeStatus === 'ended') {
        return {
          isAvailable: false,
          message: '이벤트가 종료되었습니다.',
        };
      }

      // 'upcoming' 상태인 경우, 추가 가용성 체크 필요 없음
      if (timeStatus === 'upcoming') {
        return {
          isAvailable: false,
          message: '이벤트가 곧 시작됩니다.',
        };
      }

      const claimed = await this.gifitconRepository.count({
        where: [
          {
            event: { id: eventId },
            isClaimed: true,
            category: Not(GifticonCategory.LOSE),
          },
        ],
      });

      const participants = await this.findEventsParticipants(event.id);
      const participant = await this.participatnRepository.findOne({
        where: { user: { id: userId }, event: { id: eventId }, isApply: true },
      });

      if (
        event.repetition <=
        user?.claimedGifticons?.filter(({ category }) => category !== 'LOSE')
          .length
      ) {
        return {
          isAvailable: false,
          message: '당첨 완료!',
        };
      }

      if (participant) {
        return {
          isAvailable: false,
          message: '이미 참여한 이벤트 입니다.',
        };
      }

      if (totalGifticonsWithOutLose.length <= claimed) {
        return {
          isAvailable: false,
          message: '준비된 기프티콘이 소진되었습니다.',
        };
      }

      if (event.maxParticipants <= participants.count) {
        return {
          isAvailable: false,
          message: '참여자가 많아요 조금만 기다려주세요.',
        };
      }

      return {
        isAvailable: true,
        message: '이벤트 참여 가능 합니다.',
      };
    } catch (err) {
      console.log(err);
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
        isAvailable: false,
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
      isAvailable: true,
      message: '참여 완료 하였습니다.',
      userId: userId,
    };
  }

  async drawParticipant({ eventId, userId }: Partial<Message>) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw EntityNotFoundException('이벤트가 존재 하지 않습니다');
    }

    const participant = await this.participatnRepository.findOne({
      where: { user: { id: userId }, event: { id: eventId }, isApply: true },
    });

    if (!participant) {
      throw EntityNotFoundException('해당 이벤트에 참여하지 않은 유저 입니다.');
    }

    const winners = await this.participatnRepository.count({
      where: {
        event: { id: eventId },
      },
    });

    if (winners >= event.totalGifticons) {
      participant.isApply = false;
      await this.participatnRepository.save(participant);

      return {
        isWinner: false,
        message: '기프티콘이 모두 소진 되었습니다.',
        userId,
        eventId,
      };
    }

    const gifticon = await this.gifitconRepository
      .createQueryBuilder()
      .orderBy('RANDOM()') // PostgreSQL에서 지원하는 랜덤 정렬 함수
      .getOne(); // 하나의 데이터만 반환

    participant.isApply = false;

    await this.participatnRepository.save(participant);

    if (gifticon.category !== 'LOSE') {
      return {
        isWinner: true,
        message: '당첨 되었습니다!',
        userId,
        eventId,
        gifticon,
      };
    }

    return {
      isWinner: false,
      message: '꽝! 다음 기회에...',
      userId,
      eventId,
      gifticon,
    };
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
      participatedAt: new Date(),
      isApply: true,
    });
  }

  private async sendMessage({ eventId, userId }: Omit<Message, 'timestamp'>) {
    try {
      await this.sqsService.sendMessage(
        { eventId, userId, timestamp: `${getYYYYMMDDhhmm()}--${v4()}` },
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

      console.log(result);

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
    const event = await this.findEvent(
      { eventId },
      {
        relations: ['user'],
        select: ['user'],
      },
    );

    if (!event)
      if (event?.user?.id !== userId) {
        throw AuthroizationException('이벤트를 등록한 등록자가 아닙니다.');
      }

    return true;
  }

  private getTimeStatus(now: Date, startDate: Date, endDate: Date) {
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'ongoing';
    } else {
      return 'ended';
    }
  }
}
