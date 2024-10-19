import { Test, TestingModule } from '@nestjs/testing';
import { GifticonRequestLogService } from './gifticon-request-log.service';

describe('GifticonRequestLogService', () => {
  let service: GifticonRequestLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GifticonRequestLogService],
    }).compile();

    service = module.get<GifticonRequestLogService>(GifticonRequestLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
