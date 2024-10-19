import { Module } from '@nestjs/common';
import { GiftconService } from './giftcon.service';
import { GiftconController } from './giftcon.controller';

@Module({
  controllers: [GiftconController],
  providers: [GiftconService],
})
export class GiftconModule {}
