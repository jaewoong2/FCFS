import { Module } from '@nestjs/common';
import { GifticonRequestLogService } from './gifticon-request-log.service';
import { GifticonRequestLogController } from './gifticon-request-log.controller';

@Module({
  controllers: [GifticonRequestLogController],
  providers: [GifticonRequestLogService],
})
export class GifticonRequestLogModule {}
