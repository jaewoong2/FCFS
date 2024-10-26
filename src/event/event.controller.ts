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
} from '@nestjs/common';
import { EventService } from './event.service';
import { GetStatusEventDto } from './dto/get-status-event.dto';
import { PostApplyEventDto } from './dto/apply-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { FindAllEventDto } from './dto/findAll-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('api/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Delete(':eventId')
  async deleteEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() deleteEventDto: UpdateEventDto,
  ) {
    const isOwnerOfEvent = await this.eventService.isOwnerOfEvent(
      deleteEventDto.userId,
      eventId,
    );

    if (!isOwnerOfEvent) return;

    const result = await this.eventService.deleteEvent(eventId);
    return result;
  }

  @Patch(':eventId')
  async updateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const isOwnerOfEvent = await this.eventService.isOwnerOfEvent(
      updateEventDto.userId,
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
  async create(@Body() body: CreateEventDto) {
    const result = await this.eventService.createEvent(body);
    return result;
  }

  @Get(':eventId')
  async find(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() query?: FindEventDto,
  ) {
    return this.eventService.findEvent(eventId, query?.eventName);
  }

  @Get()
  async findAll(@Query() query: FindAllEventDto) {
    const result = await this.eventService.findAllEvent(query);
    return result;
  }

  @Get('status')
  async getStatus(@Query() status: GetStatusEventDto) {
    const result = await this.eventService.getStatus(status.eventId);
    return result;
  }

  @Post('apply')
  async applyEvent(@Body() metadata: PostApplyEventDto) {
    try {
      const isAvailable = await this.eventService.isAvailable(metadata);

      if (!isAvailable.isAvailable) {
        return isAvailable;
      }

      const status = await this.eventService.getStatus(metadata.eventId);

      if (!status.isAvailable) {
        return status;
      }

      const result = await this.eventService.participate(metadata);

      return result;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  @Post('draw')
  async draw(@Body() metadata: PostApplyEventDto) {
    const result = await this.eventService.drawParticipant(metadata);

    return result;
  }
}
