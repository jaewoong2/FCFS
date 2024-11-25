import { Module } from '@nestjs/common';
import { GiftiConController } from './gifticon.controller';
import { GifticonService } from './gifticon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gifticon } from './entities/gifticon.entity';
import { EventService } from 'src/event/event.service';
import { Participant } from 'src/event/entities/participant.entity';
import { SqsService } from 'src/aws/sqs.service';
import { Event } from 'src/event/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { Image } from 'src/images/entities/image.entity';
import { ImagesService } from 'src/images/images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Gifticon, Event, Participant, User, Image]),
  ],
  controllers: [GiftiConController],
  providers: [GifticonService, EventService, SqsService, ImagesService],
  exports: [GifticonService],
})
export class GifticonModule {}
