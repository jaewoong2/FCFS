import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { GetStatusEventDto } from './dto/get-status-event.dto';
import { PostApplyEventDto } from './dto/apply-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('status')
  async getStatus(@Query() status: GetStatusEventDto) {
    const result = await this.eventService.getStatus(status.eventId);
    return result;
  }

  @Post('apply')
  async applyEvent(@Body() body: PostApplyEventDto) {
    const result = await this.eventService.applyEvent(body);
    return result;
  }
}
