import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { GetStatusEventDto } from './dto/get-status-event.dto';
import { PostApplyEventDto } from './dto/apply-event.dto';

@Controller('api/event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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

  @Post('receive')
  comsumeEvent() {
    return null;
  }
}
