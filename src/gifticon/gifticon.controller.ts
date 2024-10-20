import { Controller } from '@nestjs/common';
import { GifticonService } from './gifticon.service';

@Controller('gifticon')
export class GiftiConController {
  constructor(private readonly giftiConService: GifticonService) {}
}
