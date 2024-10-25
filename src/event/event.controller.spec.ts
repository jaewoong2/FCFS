import { Test, TestingModule } from '@nestjs/testing';

import { EventController } from './event.controller';
import { EventService } from './event.service';

import { AppModule } from 'src/app.module';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<EventService>(EventService);
    controller = module.get<EventController>(EventController);
  });

  afterEach(async () => {});

  it('100명이 이벤트에 대기 합니다.', async () => {
    const eventId = 2;
    const concurrentRequests = [];

    // Create 100 concurrent requests with different user IDs (1~100)
    for (let userId = 6; userId <= 105; userId++) {
      const request = await controller.applyEvent({ eventId, userId });
      concurrentRequests.push(request);
    }

    // Execute all requests concurrently
    // const results = await Promise.all(concurrentRequests);
    console.log(concurrentRequests.map((v) => v.message));
    // Optionally check if event participants count is correct
    const participants = await service.findEventsParticipants(eventId);

    expect(participants.count).toBeLessThanOrEqual(100);
  });

  it('기프티콘 추첨을 합니다.', async () => {});
});
