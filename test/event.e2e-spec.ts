import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { EventService } from 'src/event/event.service';
import { INestApplication } from '@nestjs/common';
import api from 'supertest';
import { SqsService } from 'src/aws/sqs.service';

describe('EventController', () => {
  let service: EventService;
  let sqs: SqsService;

  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<EventService>(EventService);
    sqs = module.get<SqsService>(SqsService);

    app = module.createNestApplication();
    await sqs.createQueue();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await sqs.deleteQueue();
  });

  it(
    '100명이 이벤트에 대기 합니다.',
    async () => {
      const eventId = 2;
      const concurrentRequests: any[] = [];

      // Create 100 concurrent requests with different user IDs (1~100)
      for (let userId = 6; userId <= 25; userId++) {
        const server = app.getHttpServer();
        const request = api(server)
          .post('/api/event/apply')
          .send({ eventId, userId });

        concurrentRequests.push([request, server]);
      }

      // Execute all requests concurrently
      // 동시에 15개의 요청을 보냄 (최대 10개 만 참여 가능)
      const result = await Promise.all(
        concurrentRequests.map(async (promise) => {
          const result = await promise[0];

          const text = result.toJSON().text;
          const res = JSON.parse(text).data;

          const userId = JSON.parse(text).data.userId;

          if ('isAvailable' in res && !res.isAvailable) {
            return res;
          }

          const processedResult: any = await api(promise[1])
            .post('/api/event/draw')
            .send({ eventId, userId });

          const drawResult = JSON.parse(processedResult.toJSON().text);

          if (drawResult?.data?.isWinner) {
            const result: any = await api(promise[1])
              .post('/api/gifticon/claim')
              .send({ eventId, userId });

            return JSON.parse(result.toJSON().text).data;
          }

          return drawResult.data;
        }),
      );

      console.log(result);

      // Queue 에 Max Participants 많큼 쌓여 있음.
      const participants = await service.findEventsParticipants(eventId);

      expect(participants.count).toBeLessThanOrEqual(10);
    },
    3000 * 10,
  );

  it('기프티콘 추첨을 합니다.', async () => {});
});
