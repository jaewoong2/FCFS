import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GifticonService } from './gifticon.service';
import { UpdateGifticonDto } from './dto/update-gifticon.dto';
import { CreateGifticonDto } from './dto/create-gifticon.dto';
import { FindGifticonDto } from './dto/find-gifticon.dto';
import { FindAllGifticonDto } from './dto/find-all-gifticon.dto';

@Controller('api/gifticon')
export class GiftiConController {
  constructor(private readonly giftiConService: GifticonService) {}

  @Delete(':gifticonId')
  async delete(
    @Param('gifticonId', ParseIntPipe) gifticonId: number,
    @Body() deleteGifticonDto: UpdateGifticonDto,
  ) {
    const isOwnerOfGifticon = await this.giftiConService.isOwnerOfGifticon(
      deleteGifticonDto.userId,
      gifticonId,
    );

    if (!isOwnerOfGifticon) return;

    const result = await this.giftiConService.delete(gifticonId);
    return result;
  }

  @Patch(':gifticonId')
  async update(
    @Param('gifticonId', ParseIntPipe) gifticonId: number,
    @Body() updateGifticonDto: UpdateGifticonDto,
  ) {
    const isOwnerOfGifticon = await this.giftiConService.isOwnerOfGifticon(
      updateGifticonDto.userId,
      gifticonId,
    );

    if (!isOwnerOfGifticon) return;

    const updatedGifticon = await this.giftiConService.update(
      gifticonId,
      updateGifticonDto,
    );

    return updatedGifticon;
  }

  @Post()
  async create(@Body() body: CreateGifticonDto) {
    const result = await this.giftiConService.create(body);
    return result;
  }

  @Get(':giftiConId')
  async find(
    @Param('giftiConId', ParseIntPipe) giftiConId: number,
    @Query() query?: FindGifticonDto,
  ) {
    return this.giftiConService.find(giftiConId, query?.name);
  }

  @Get()
  async findAll(@Query() query: FindAllGifticonDto) {
    const result = await this.giftiConService.findAll(query);
    return result;
  }
}
