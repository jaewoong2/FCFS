import { Test, TestingModule } from '@nestjs/testing';
import { GiftconService } from './gifticon.service';

describe('GiftconService', () => {
  let service: GiftconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiftconService],
    }).compile();

    service = module.get<GiftconService>(GiftconService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
