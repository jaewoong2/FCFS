import { Test, TestingModule } from '@nestjs/testing';
import { GiftconController } from './gifticon.controller';
import { GiftconService } from './giftcon.service';

describe('GiftconController', () => {
  let controller: GiftconController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiftconController],
      providers: [GiftconService],
    }).compile();

    controller = module.get<GiftconController>(GiftconController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
