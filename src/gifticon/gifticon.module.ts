import { Module } from '@nestjs/common';
import { GiftiConController } from './gifticon.controller';
import { GifticonService } from './gifticon.service';

@Module({
  controllers: [GiftiConController],
  providers: [GifticonService],
})
export class GifticonModule {}
