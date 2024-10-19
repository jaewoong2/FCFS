import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GifticonRequestLogService } from './gifticon-request-log.service';
import { CreateGifticonRequestLogDto } from './dto/create-gifticon-request-log.dto';
import { UpdateGifticonRequestLogDto } from './dto/update-gifticon-request-log.dto';

@Controller('gifticon-request-log')
export class GifticonRequestLogController {
  constructor(private readonly gifticonRequestLogService: GifticonRequestLogService) {}

  @Post()
  create(@Body() createGifticonRequestLogDto: CreateGifticonRequestLogDto) {
    return this.gifticonRequestLogService.create(createGifticonRequestLogDto);
  }

  @Get()
  findAll() {
    return this.gifticonRequestLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gifticonRequestLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGifticonRequestLogDto: UpdateGifticonRequestLogDto) {
    return this.gifticonRequestLogService.update(+id, updateGifticonRequestLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gifticonRequestLogService.remove(+id);
  }
}
