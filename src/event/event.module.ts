import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Event } from './entities/event.entity';
import { SqsService } from 'src/aws/sqs.service';
import { Participant } from './entities/participant.entity';
import { User } from 'src/users/entities/user.entity';
import { Image } from 'src/images/entities/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gifticon, Event, Participant, User, Image]),
  ],
  controllers: [EventController],
  providers: [EventService, SqsService],
  exports: [EventService],
})
export class EventModule {}
