import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { EntityNotFoundException } from 'src/core/filters/exception/service.exception';
import { filterObjectByExpectedKeys } from 'src/core/utils/filterObjectByExpectedKeys';
import { GiftiConController } from './gifticon.controller';
import { CreateGifticonDto } from './dto/create-gifticon.dto';
import { FindAllGifticonDto } from './dto/find-all-gifticon.dto';
import { UpdateGifticonDto } from './dto/update-gifticon.dto';
import { CreateNotFoundMessage } from './gifticon.service';

describe('GiftiConController', () => {
  let controller: GiftiConController;

  const GIFTICON: CreateGifticonDto = {
    name: 'New Gifticon' + Math.random().toString(),
    description: 'New Gifticon',
    imageUrl: 'testUrl' + Math.random().toString(),
    eventId: 2,
    userId: 6,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    controller = module.get<GiftiConController>(GiftiConController);
  });

  afterEach(async () => {});

  describe('create', () => {
    it('새로운 기프티콘을 생성 합니다.', async () => {
      const excpectd = {
        name: GIFTICON.name,
        description: GIFTICON.description,
        imageUrl: GIFTICON.imageUrl,
      };

      const result = await controller.create(GIFTICON);
      expect(filterObjectByExpectedKeys(result, excpectd)).toEqual(excpectd);
    });
  });

  describe('find', () => {
    it('기프티콘을 이름 으로 찾습니다.', async () => {
      const params = { name: GIFTICON.name };

      const result = await controller.find(null, params);

      expect(filterObjectByExpectedKeys(result, params)).toEqual(params);
    });

    it('기프티콘을 찾지 못하면 Not Found Exception', async () => {
      const params = { name: 'Not Exist Gifticon Name' };

      await expect(controller.find(null, params)).rejects.toThrow(
        EntityNotFoundException(CreateNotFoundMessage(null, params.name)),
      );
    });
  });

  describe('findAll', () => {
    it('모든 기프티콘을 찾습니다.', async () => {
      const findAllGifticonDto: FindAllGifticonDto = { page: 1, limit: 10 };

      const result = await controller.findAll(findAllGifticonDto);

      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('update', () => {
    it('기프티콘을 업데이트 합니다', async () => {
      const { id: GifticonId } = await controller.find(null, {
        name: GIFTICON.name,
      });

      const updateDto: UpdateGifticonDto = {
        name: GIFTICON.name,
        imageUrl: GIFTICON.imageUrl,
        description: 'Updated Gifticon',
      };

      const mockUpdatedGifticon = { id: GifticonId, ...updateDto } as any;

      const result = await controller.update(GifticonId, updateDto);

      expect(filterObjectByExpectedKeys(result, mockUpdatedGifticon)).toEqual(
        mockUpdatedGifticon,
      );
    });

    it('기프티콘을 찾지 못하면 Notfound', async () => {
      const id = 999;
      const updateGifticon: UpdateGifticonDto = {
        description: 'Updated Gifticon',
      };

      await expect(controller.update(id, updateGifticon)).rejects.toThrow(
        CreateNotFoundMessage(id, updateGifticon.name),
      );
    });
  });

  describe('delete', () => {
    it('기프티콘을 삭제 합니다', async () => {
      const { id: gifticonId } = await controller.find(null, {
        name: GIFTICON.name,
      });

      const result = await controller.delete(gifticonId, {
        userId: GIFTICON.userId,
      });

      expect(filterObjectByExpectedKeys(result, { affected: 1 })).toEqual({
        affected: 1,
      });
    });

    it('should throw NotFoundException if not found', async () => {
      const id = 999;

      await expect(
        controller.delete(id, {
          userId: GIFTICON.userId,
        }),
      ).rejects.toThrow(
        EntityNotFoundException(CreateNotFoundMessage(id, GIFTICON.name)),
      );
    });
  });
});
