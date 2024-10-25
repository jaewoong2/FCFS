import { Injectable } from '@nestjs/common';
import { SQS } from 'aws-sdk';
import { ChangeMessageVisibilityRequest } from 'aws-sdk/clients/sqs';

@Injectable()
export class SqsService {
  constructor() {}

  private sqs = new SQS({
    region: 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SQS_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.AWS_SQS_ENDPOINT_URL,
  });
  private queueUrl = process.env.AWS_SQS_QUEUE_URL;

  createQueue() {
    return this.sqs
      .createQueue({
        QueueName: 'sqs-services.fifo',
        Attributes: {
          FifoQueue: 'true',
          ContentBasedDeduplication: 'true',
        },
      })
      .promise();
  }

  deleteQueue() {
    return this.sqs
      .deleteQueue({
        QueueUrl: this.queueUrl,
      })
      .promise();
  }

  async sendMessage<T extends { [key: string]: any }>(
    message: T,
    options: Partial<SQS.Types.SendMessageRequest>,
  ) {
    const params: SQS.Types.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
      ...options,
    };

    const result = await this.sqs.sendMessage(params).promise();
    return result;
  }

  changeMessageVisibility(
    params: Omit<ChangeMessageVisibilityRequest, 'QueueUrl'>,
  ) {
    return this.sqs.changeMessageVisibility({
      QueueUrl: this.queueUrl,
      ...params,
    });
  }

  async receiveMessage(options?: Partial<SQS.Types.ReceiveMessageRequest>) {
    const params: SQS.Types.ReceiveMessageRequest = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 1,
      VisibilityTimeout: 20, // 받으면 30초 동안 안보이게 만듬 -> 다른 Queue 에서 못가져감
      WaitTimeSeconds: 5, // Message 를 받을 동안 5초 동안 기다림
      AttributeNames: ['All'],
      MessageAttributeNames: ['All'],
      ...options,
    };

    const result = await this.sqs.receiveMessage(params).promise();

    if (result.Messages.length === 0) {
      return null;
    }

    return result;
  }

  async deleteMessage(receiptHandle: string) {
    return await this.sqs
      .deleteMessage({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      })
      .promise();
  }
}
