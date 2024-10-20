import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Event } from './entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gifticon, Event])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
