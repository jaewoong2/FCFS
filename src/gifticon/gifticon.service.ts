import { Injectable } from '@nestjs/common';
import { Gifticon } from './entities/gifticon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Not, Repository } from 'typeorm';
import {
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
import { ImagesService } from 'src/images/images.service';

const DEFAULT_IMAGE = 'https://d3t7exr31xs1l7.cloudfront.net/images/ramram.png';

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
    private readonly dataSource: DataSource,
    @InjectRepository(Gifticon)
    private readonly gifticonRepository: Repository<Gifticon>,

    @InjectRepository(Participant)
    private readonly participantRepository: Repository<Participant>,

    private readonly imagesService: ImagesService,

    private readonly eventService: EventService,
  ) {}

  async delete(gifticonId: number) {
    const gifticon = await this.find(gifticonId, null, {
      select: ['event', 'image'],
      relations: ['event', 'image'],
    });

    await this.eventService.updateEvent(gifticon.event.id, null, (event) => {
      event.totalGifticons = event.totalGifticons - 1;
      return event;
    });

    return await this.gifticonRepository.softRemove({ id: gifticonId });
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
      const image = await this.imagesService.findOrCreate(
        {
          where: {
            imageUrl: imageUrl ?? DEFAULT_IMAGE,
            event: null,
            gifticon: null,
          },
        },
        { imageUrl: imageUrl, name: imageUrl },
      );

      gifticon.image = image;
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

  async create(
    userId: number,
    {
      description,
      eventId,
      imageUrl,
      name,
      category,
      message,
    }: CreateGifticonDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      if (category === 'LOSE' && !imageUrl) {
        imageUrl = 'https://d3t7exr31xs1l7.cloudfront.net/images/ramram.png';
      }

      const image = await this.imagesService.findOrCreate(
        {
          where: { imageUrl: imageUrl, gifticon: Not(Not(null)) },
        },
        { imageUrl, name: imageUrl },
      );

      const newGifticon = this.gifticonRepository.create({
        name,
        description,
        category,
        message,
        image: { id: image.id },
        event: { id: eventId },
        user: { id: userId },
      });

      await this.eventService.updateEvent(
        eventId,
        null,
        (event) => {
          event.totalGifticons = event.totalGifticons + 1;
          return event;
        },
        queryRunner.manager,
      );

      const result = await this.gifticonRepository.save(newGifticon);

      this.imagesService.updateImage(() => {
        image.gifticon = result;
        return image;
      });

      await queryRunner.commitTransaction();

      return {
        message: `${name} 기프티콘을 생성 하였습니다.`,
        eventId: result.event.id,
        gifticonId: result.id,
      };
    } catch (error) {
      // If any error occurs, rollback the transaction
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error to handle it at the controller level or higher
    } finally {
      // Release the query runner (important for cleaning up resources)
      await queryRunner.release();
    }
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
        where: { user: { id: userId }, event: { id: eventId }, isApply: true },
        relations: ['user'],
      });

      if (!participant) {
        throw ValidatationErrorException('참여하지 않은 유저 입니다.');
      }

      if (!gifticon) {
        throw EntityNotFoundException(CreateNotFoundMessage());
      }

      participant.isApply = false;

      gifticon.isClaimed = true;
      gifticon.claimedAt = new Date();
      gifticon.claimedBy = participant.user;

      const result = await this.gifticonRepository.save(gifticon);
      await this.participantRepository.save(participant);

      await this.eventService.updateEvent(gifticon.event.id, null, (event) => {
        event.totalGifticons = event.totalGifticons - 1;
        return event;
      });

      return result;
    } catch (err) {
      const participant = await this.participantRepository.findOne({
        where: { user: { id: userId }, event: { id: eventId }, isApply: true },
        relations: ['user'],
      });

      if (participant) {
        participant.isApply = false;
        await this.participantRepository.save(participant);
      }

      throw err;
    }
  }

  async getRandomGifticon(eventId: number) {
    await this.eventService.findEvent({ eventId });

    const gifticons = await this.gifticonRepository.find({
      where: { event: { id: eventId }, isClaimed: false },
      relations: ['event', 'image'],
    });

    if (gifticons.length === 0) {
      throw EntityNotFoundException('기프티콘이 모두 소진 되었어요..!');
    }

    return this.getRandomElement(gifticons);
  }

  private getRandomElement = <T>(arr: T[]) =>
    arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}
