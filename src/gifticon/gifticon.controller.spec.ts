import { Test, TestingModule } from '@nestjs/testing';
import { GiftiConController } from './gifticon.controller';
import { GifticonService } from './gifticon.service';

describe('GiftconController', () => {
  let controller: GiftiConController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiftiConController],
      providers: [GifticonService],
    }).compile();

    controller = module.get<GiftiConController>(GiftiConController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
