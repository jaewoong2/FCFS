import { Controller, Get, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { GetStatusDto } from './dto/get-status.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /**
   * /event/status
   */
  @Get('status')
  async getStatus(@Query() status: GetStatusDto) {
    const result = await this.eventService.getStatus(status.eventId);
    return result;
  }
}
