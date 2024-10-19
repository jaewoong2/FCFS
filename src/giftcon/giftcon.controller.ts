import { Controller, Post, Body } from '@nestjs/common';
import { GiftconService } from './giftcon.service';

@Controller('giftcon')
export class GiftConController {
  private MAX_VOUCHERS = 100;

  constructor(private readonly giftConService: GiftconService) {}

  @Post('request')
  async requestVoucher(@Body('userId') userId: string) {
    try {
      const voucherCount = await this.giftConService.count();

      // Send message to SQS
      const messageBody = {
        userId,
        requestId: uuidv4(),
      };
      await this.sqs
        .sendMessage({
          QueueUrl: 'your-sqs-queue-url',
          MessageBody: JSON.stringify(messageBody),
        })
        .promise();

      return { message: 'Your request is being processed' };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
