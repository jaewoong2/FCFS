import { Module } from '@nestjs/common';
import { GiftiConController } from './gifticon.controller';
import { GifticonService } from './gifticon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gifticon } from './entities/gifticon.entity';
import { EventService } from 'src/event/event.service';
import { Participant } from 'src/event/entities/participant.entity';
import { SqsService } from 'src/sqs/sqs.service';
import { Event } from 'src/event/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gifticon, Event, Participant])],
  controllers: [GiftiConController],
  providers: [GifticonService, EventService, SqsService],
  exports: [GifticonService],
})
export class GifticonModule {}
