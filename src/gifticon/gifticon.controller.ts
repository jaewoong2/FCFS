import { Controller } from '@nestjs/common';
import { GifticonService } from './gifticon.service';

@Controller('gifticon')
export class GiftiConController {
  private MAX_VOUCHERS = 100;

  constructor(private readonly giftiConService: GifticonService) {}
}
