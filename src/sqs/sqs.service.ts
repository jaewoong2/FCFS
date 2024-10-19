import { Injectable } from '@nestjs/common';
import { SQS } from 'aws-sdk';

@Injectable()
export class SqsService {
  constructor() {}

  private sqs = new SQS({ region: 'ap-northeast-2' });
  private queueUrl =
    'https://sqs.ap-northeast-2.amazonaws.com/849441246713/RamSQS';

  async sendMessage(message: any) {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    };

    await this.sqs.sendMessage(params).promise();
  }
}
