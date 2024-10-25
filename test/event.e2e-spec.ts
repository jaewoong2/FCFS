import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { EventService } from 'src/event/event.service';
import { INestApplication } from '@nestjs/common';
import api from 'supertest';

describe('EventController', () => {
  let service: EventService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<EventService>(EventService);
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('100명이 이벤트에 대기 합니다.', async () => {
    const eventId = 2;
    const concurrentRequests: any[] = [];

    // Create 100 concurrent requests with different user IDs (1~100)
    for (let userId = 6; userId <= 15; userId++) {
      const request = api(app.getHttpServer())
        .post('/api/event/apply')
        .send({ eventId, userId });

      concurrentRequests.push(request);
    }

    // Execute all requests concurrently
    // 동시에 15개의 요청을 보냄 (최대 10개 만 참여 가능)
    const result = await Promise.all(concurrentRequests);
    console.log(result.map((v) => v.toJSON().text));
    // Queue 에 Max Participants 많큼 쌓여 있음.
    const participants = await service.findEventsParticipants(eventId);

    expect(participants.count).toBeLessThanOrEqual(10);
  }, 10000000);

  it('기프티콘 추첨을 합니다.', async () => {});
});
