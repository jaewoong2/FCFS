import { Module } from '@nestjs/common';
import { GiftiConController } from './gifticon.controller';
import { GifticonService } from './gifticon.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gifticon } from './entities/gifticon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gifticon, Event])],
  controllers: [GiftiConController],
  providers: [GifticonService],
})
export class GifticonModule {}
