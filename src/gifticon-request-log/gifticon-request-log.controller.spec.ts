import { Test, TestingModule } from '@nestjs/testing';
import { GifticonRequestLogController } from './gifticon-request-log.controller';
import { GifticonRequestLogService } from './gifticon-request-log.service';

describe('GifticonRequestLogController', () => {
  let controller: GifticonRequestLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GifticonRequestLogController],
      providers: [GifticonRequestLogService],
    }).compile();

    controller = module.get<GifticonRequestLogController>(GifticonRequestLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
