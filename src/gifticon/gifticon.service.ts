import { Injectable } from '@nestjs/common';
import { Gifticon } from './entities/gifticon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import {
  AlereadyExistException,
  AuthroizationException,
  EntityNotFoundException,
  ValidatationErrorException,
} from 'src/core/filters/exception/service.exception';
import { CreateGifticonDto } from './dto/create-gifticon.dto';
import { FindAllGifticonDto } from './dto/find-all-gifticon.dto';
import { UpdateGifticonDto } from './dto/update-gifticon.dto';
import { EventService } from 'src/event/event.service';
import { ClaimGifticonDto } from './dto/claim-gifticon.dto';
import { Participant } from 'src/event/entities/participant.entity';

export const CreateNotFoundMessage = (id?: number, name?: string) => {
  if (id) {
    return `GifticonId: ${id}인, 기프티콘이 존재 하지 않습니다.`;
  }

  if (name) {
    return `GifticonName: ${name}인, 기프티콘이 존재 하지 않습니다.`;
  }

  return '기프티콘이 존재 하지 않습니다.';
};

@Injectable()
export class GifticonService {
  constructor(
    @InjectRepository(Gifticon)
    private readonly gifticonRepository: Repository<Gifticon>,

    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,

    private readonly eventService: EventService,
  ) {}

  async delete(gifticonId: number) {
    const gifticon = await this.find(gifticonId, null, {
      select: ['event'],
      relations: ['event'],
    });

    await this.eventService.updateEvent(gifticon.event.id, null, (event) => {
      event.totalGifticons = event.totalGifticons - 1;
      return event;
    });

    return await this.gifticonRepository.softDelete(gifticonId);
  }

  async update(
    gifticonId: number,
    { description, imageUrl, name }: UpdateGifticonDto,
  ) {
    const gifticon = await this.find(gifticonId);

    // 선택적 업데이트: 각 필드가 주어졌을 때만 업데이트
    if (description) {
      gifticon.description = description;
    }
    if (imageUrl) {
      gifticon.imageUrl = imageUrl;
    }
    if (name) {
      gifticon.name = name;
    }
    // 변경사항 저장
    return this.gifticonRepository.save(gifticon);
  }

  async find(
    gifticonId: number,
    name?: string,
    options?: FindOneOptions<Gifticon>,
    withException: boolean = true,
  ) {
    const gifticon = await this.gifticonRepository.findOne({
      where: [{ id: gifticonId }, { name: name }],
      ...options,
    });

    if (withException && !gifticon) {
      throw EntityNotFoundException(CreateNotFoundMessage(gifticonId, name));
    }

    return gifticon;
  }

  async findAll({
    name,
    description,
    userId,
    page = 1,
    limit = 10,
  }: FindAllGifticonDto) {
    const queryBuilder = this.gifticonRepository.createQueryBuilder('gifticon');

    if (name) {
      queryBuilder.andWhere('LOWER(gifticon.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      });
    }

    if (description) {
      queryBuilder.andWhere('gifticon.description LIKE :description', {
        description: `%${description}%`,
      });
    }

    if (userId) {
      queryBuilder.andWhere('gifticon.userId :userId', { userId });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    queryBuilder.orderBy('gifticon.createdAt', 'ASC');

    const [result, total] = await queryBuilder.getManyAndCount();

    return {
      data: result,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async create({
    description,
    eventId,
    imageUrl,
    name,
    userId,
  }: CreateGifticonDto) {
    const gifticon = await this.find(null, name, null, false);

    if (gifticon) {
      throw AlereadyExistException(`기프티콘 ${name}은 이미 존재 합니다.`);
    }

    const newGifticon = this.gifticonRepository.create({
      name,
      description,
      imageUrl,
      event: { id: eventId },
      user: { id: userId },
    });

    await this.eventService.updateEvent(eventId, null, (event) => {
      event.totalGifticons = event.totalGifticons + 1;
      return event;
    });

    const result = await this.gifticonRepository.save(newGifticon);

    return result;
  }

  async isOwnerOfGifticon(userId: number, gifticonId: number) {
    const event = await this.find(gifticonId, null, {
      relations: ['user'],
      select: ['user'],
    });

    if (!event)
      if (event?.user?.id !== userId) {
        throw AuthroizationException('기프티콘을 등록한 등록자가 아닙니다.');
      }

    return true;
  }

  async claim({ eventId, userId }: ClaimGifticonDto) {
    try {
      const gifticon = await this.getRandomGifticon(eventId);
      const participant = await this.participantRepository.findOne({
        where: { user: { id: userId }, event: { id: eventId } },
        relations: ['user'],
      });

      if (!participant || !participant.gifticonIssued) {
        throw ValidatationErrorException(
          '기프티콘 당첨 되지 못한 유저 입니다.',
        );
      }

      if (!gifticon) {
        throw EntityNotFoundException(CreateNotFoundMessage());
      }

      gifticon.isClaimed = true;
      gifticon.claimedAt = new Date();
      gifticon.claimedBy = participant.user;

      const result = await this.gifticonRepository.save(gifticon);

      await this.eventService.updateEvent(gifticon.event.id, null, (event) => {
        event.totalGifticons = event.totalGifticons - 1;
        return event;
      });

      return result;
    } catch (err) {
      return err;
    }
  }

  async getRandomGifticon(eventId: number) {
    const gifticons = await this.gifticonRepository.find({
      where: { event: { id: eventId }, isClaimed: false },
      relations: ['event'],
    });

    if (gifticons.length === 0) {
      throw EntityNotFoundException('기프티콘이 모두 소진 되었어요..!');
    }

    return this.getRandomElement(gifticons);
  }

  getRandomElement = <T>(arr: T[]) =>
    arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}
