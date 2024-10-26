import { Test, TestingModule } from '@nestjs/testing';
import { GifticonService } from './gifticon.service';

describe('GiftconService', () => {
  let service: GifticonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GifticonService],
    }).compile();

    service = module.get<GifticonService>(GifticonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
