import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { GetStatusEventDto } from './dto/get-status-event.dto';
import { PostApplyEventDto } from './dto/apply-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventDto } from './dto/findAll-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  AuthroizationException,
  ValidatationErrorException,
} from 'src/core/filters/exception/service.exception';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { AuthProvider, User } from 'src/users/entities/user.entity';
import { UseOptionalJwtAuthGuard } from 'src/auth/guard/use-optional-auth.guard';

@Controller('api/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('status')
  async getStatus(@Query() status: GetStatusEventDto) {
    const result = await this.eventService.getStatus(status);
    return result;
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard)
  async deleteEvent(
    @Req() request: { user: User },
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    const isOwnerOfEvent = await this.eventService.isOwnerOfEvent(
      request.user.id,
      eventId,
    );

    if (!isOwnerOfEvent) return;

    const result = await this.eventService.deleteEvent(eventId);
    return result;
  }

  @Patch(':eventId')
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Req() request: { user: User },
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const isOwnerOfEvent = await this.eventService.isOwnerOfEvent(
      request.user.id,
      eventId,
    );

    if (!isOwnerOfEvent) return;

    const updatedEvent = await this.eventService.updateEvent(
      eventId,
      updateEventDto,
    );

    return updatedEvent;
  }

  @Post()
  @UseOptionalJwtAuthGuard({
    callback(user) {
      if (!user)
        return { message: '유저가 존재 하지 않습니다.', shouldPass: false };
      if (user.provider === AuthProvider.EMAIL)
        return {
          message: '이벤트를 생성 할 수 없습니다. 소셜 로그인 후 이용해주세요.',
          shouldPass: false,
        };
      return { message: '이벤트를 생성 할 수 있습니다.', shouldPass: true };
    },
  })
  async create(@Req() request: { user: User }, @Body() body: CreateEventDto) {
    const result = await this.eventService.createEvent({
      ...body,
      userName: request.user.userName,
    });
    return result;
  }

  @Get('participate')
  async findEvent(@Query() query?: FindEventDto) {
    const result = await this.eventService.findEvent(query);

    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async find(@Req() request: { user: User }, @Query() query?: FindEventDto) {
    const result = await this.eventService.findEvent(query, {
      order: { gifticons: { updateAt: 'DESC' } },
    });

    if (result.user.id !== request.user.id) {
      throw AuthroizationException('잘못된 유저 접근 입니다.');
    }

    return result;
  }

  @Get('all')
  async findAll(@Query() query: FindAllEventDto) {
    const result = await this.eventService.paginate(query, (queryBuilder) => {
      if (query?.name) {
        queryBuilder.andWhere('LOWER(event.eventName) LIKE LOWER(:name)', {
          name: `%${query?.name}%`,
        });
      }

      if (query?.description) {
        queryBuilder.andWhere('event.eventDescription LIKE :description', {
          description: `%${query?.description}%`,
        });
      }

      if (query?.userName) {
        queryBuilder.andWhere('user.userName = :userName', {
          userName: `${query.userName}`,
        });
      }

      if (query?.status === 'FINISHED') {
        // 이미 종료된 이벤트: 종료일이 현재 날짜 이전
        queryBuilder.andWhere('event.eventEndDate < :now', { now: new Date() });
      }

      if (query?.status === 'ONGOING') {
        // 현재 진행 중인 이벤트: 시작일이 현재 날짜 이전 또는 같고, 종료일이 현재 날짜 이후 또는 같음
        queryBuilder
          .andWhere('event.eventStartDate <= :now', { now: new Date() })
          .andWhere('event.eventEndDate >= :now', { now: new Date() });
      }

      if (query?.status === 'UPCOMING') {
        // 앞으로 진행될 이벤트: 시작일이 현재 날짜 이후
        queryBuilder.andWhere('event.eventStartDate > :now', {
          now: new Date(),
        });
      }

      if (query?.startDate && query?.endDate) {
        queryBuilder
          .andWhere('event.eventStartDate <= :endDate', {
            endDate: query.endDate,
          })
          .andWhere('event.eventEndDate >= :startDate', {
            startDate: query.startDate,
          });
      } else if (query?.startDate) {
        queryBuilder.andWhere('event.eventEndDate >= :startDate', {
          startDate: query.startDate,
        });
      } else if (query?.endDate) {
        queryBuilder.andWhere('event.eventStartDate <= :endDate', {
          endDate: query.endDate,
        });
      }

      // 유효성 검사: endDate가 startDate보다 앞서면 에러 발생
      if (
        query?.startDate &&
        query?.endDate &&
        new Date(query?.startDate) > new Date(query?.endDate)
      ) {
        throw ValidatationErrorException('startDate cannot be after endDate');
      }

      return queryBuilder;
    });
    return result;
  }

  @Post('apply')
  async applyEvent(@Body() metadata: PostApplyEventDto) {
    try {
      const isAvailable = await this.eventService.isAvailable(metadata);

      if (!isAvailable.isAvailable) {
        return isAvailable;
      }

      const status = await this.eventService.getStatus(metadata);

      if (!status.isAvailable) {
        return status;
      }

      const result = await this.eventService.participate(metadata);

      return result;
    } catch (err) {
      throw err;
    }
  }

  @Post('draw')
  async draw(@Body() metadata: PostApplyEventDto) {
    const result = await this.eventService.drawParticipant(metadata);

    return result;
  }
}
