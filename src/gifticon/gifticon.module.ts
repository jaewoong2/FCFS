import { Module } from '@nestjs/common';
import { GiftconService } from './gifticon.service';
import { GiftconController } from './gifticon.controller';

@Module({
  controllers: [GiftconController],
  providers: [GiftconService],
})
export class GiftconModule {}
