import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Event } from './entities/event.entity';
import { SqsService } from 'src/sqs/sqs.service';
import { Participant } from './entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gifticon, Event, Participant])],
  controllers: [EventController],
  providers: [EventService, SqsService],
  exports: [EventService],
})
export class EventModule {}
