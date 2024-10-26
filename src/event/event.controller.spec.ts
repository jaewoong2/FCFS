import { Test, TestingModule } from '@nestjs/testing';

import { EventController } from './event.controller';

import { AppModule } from 'src/app.module';
import { FindAllEventDto } from './dto/findAll-event.dto';
import { EntityNotFoundException } from 'src/core/filters/exception/service.exception';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { filterObjectByExpectedKeys } from 'src/core/utils/filterObjectByExpectedKeys';

describe('EventController', () => {
  let controller: EventController;
  const createEventDto: CreateEventDto = {
    eventName: 'New Event' + Math.random().toString(),
    eventDescription: 'New Event',
    eventStartDate: new Date(),
    eventEndDate: new Date(),
    maxParticipants: 100,
    totalGifticons: 0,
    userId: 6,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    controller = module.get<EventController>(EventController);
  });

  afterEach(async () => {});

  describe('create', () => {
    it('should create a new event', async () => {
      const result = await controller.create(createEventDto);
      expect(filterObjectByExpectedKeys(result, createEventDto)).toEqual({
        eventName: createEventDto.eventName,
        eventDescription: createEventDto.eventDescription,
        eventStartDate: createEventDto.eventStartDate,
        eventEndDate: createEventDto.eventEndDate,
        maxParticipants: createEventDto.maxParticipants,
        totalGifticons: createEventDto.totalGifticons,
      });
    });
  });

  describe('find', () => {
    it('should return a single event by ID', async () => {
      const eventId = 2;
      const mockEvent = { id: eventId, eventName: 'test' } as any;

      const result = await controller.find(eventId);

      expect(filterObjectByExpectedKeys(result, mockEvent)).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event is not found', async () => {
      const eventId = 999;

      await expect(controller.find(eventId)).rejects.toThrow(
        EntityNotFoundException(`Event 가 없습니다. EventId: ${eventId}`),
      );
    });
  });

  describe('findAll', () => {
    it('should return a list of events', async () => {
      const findAllEventDto: FindAllEventDto = { page: 1, limit: 10 };

      const result = await controller.findAll(findAllEventDto);

      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const { id: eventId } = await controller.find(-1, {
        eventName: createEventDto.eventName,
      });
      const updateEventDto: UpdateEventDto = {
        eventDescription: 'Updated Event',
      };
      const mockUpdatedEvent = { id: eventId, ...updateEventDto } as any;

      const result = await controller.updateEvent(eventId, updateEventDto);
      expect(filterObjectByExpectedKeys(result, mockUpdatedEvent)).toEqual(
        mockUpdatedEvent,
      );
    });

    it('should throw NotFoundException if event is not found', async () => {
      const eventId = 999;
      const updateEventDto: UpdateEventDto = { eventName: 'Updated Event' };

      await expect(
        controller.updateEvent(eventId, updateEventDto),
      ).rejects.toThrow(
        EntityNotFoundException(`Event 가 없습니다. EventId: ${eventId}`),
      );
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const { id: eventId } = await controller.find(-1, {
        eventName: createEventDto.eventName,
      });

      const result = await controller.deleteEvent(eventId, {
        userId: createEventDto.userId,
      });

      expect(filterObjectByExpectedKeys(result, { affected: 1 })).toEqual({
        affected: 1,
      });
    });

    it('should throw NotFoundException if event is not found', async () => {
      const eventId = 999;

      await expect(
        controller.deleteEvent(eventId, {
          userId: createEventDto.userId,
        }),
      ).rejects.toThrow(
        EntityNotFoundException(`Event 가 없습니다. EventId: ${eventId}`),
      );
    });
  });
});
