import { Injectable } from '@nestjs/common';
import { SQS } from 'aws-sdk';

@Injectable()
export class SqsService {
  constructor() {}

  private sqs = new SQS({ region: 'ap-northeast-2' });
  private queueUrl =
    'http://sqs.ap-northeast-2.localhost.localstack.cloud:4566/000000000000/sqs-services.fifo';

  async sendMessage<T extends { [key: string]: any }>(message: T) {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    };

    return await this.sqs.sendMessage(params).promise();
  }
}
