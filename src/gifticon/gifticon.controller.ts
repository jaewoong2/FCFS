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
  Req,
  UseGuards,
} from '@nestjs/common';
import { GifticonService } from './gifticon.service';
import { UpdateGifticonDto } from './dto/update-gifticon.dto';
import { CreateGifticonDto } from './dto/create-gifticon.dto';
import { FindGifticonDto } from './dto/find-gifticon.dto';
import { FindAllGifticonDto } from './dto/find-all-gifticon.dto';
import { ClaimGifticonDto } from './dto/claim-gifticon.dto';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('api/gifticon')
export class GiftiConController {
  constructor(private readonly giftiConService: GifticonService) {}

  @Post('claim')
  async claim(@Body() claimGifticonDto: ClaimGifticonDto) {
    const result = await this.giftiConService.claim(claimGifticonDto);

    return result;
  }

  @Delete(':gifticonId')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Req() { user }: { user: User },
    @Param('gifticonId', ParseIntPipe) gifticonId: number,
  ) {
    const isOwnerOfGifticon = await this.giftiConService.isOwnerOfGifticon(
      user.id,
      gifticonId,
    );

    if (!isOwnerOfGifticon) return;

    const result = await this.giftiConService.delete(gifticonId);
    return result;
  }

  @Patch(':gifticonId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() { user }: { user: User },
    @Param('gifticonId', ParseIntPipe) gifticonId: number,
    @Body() updateGifticonDto: UpdateGifticonDto,
  ) {
    const isOwnerOfGifticon = await this.giftiConService.isOwnerOfGifticon(
      user.id,
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
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() { user }: { user: User },
    @Body() body: CreateGifticonDto,
  ) {
    const result = await this.giftiConService.create(user.id, { ...body });
    return result;
  }

  @Get('find')
  async find(@Query() query?: FindGifticonDto) {
    const result = await this.giftiConService.find(query?.id, query?.name);

    return result;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: FindAllGifticonDto) {
    const result = await this.giftiConService.paginate(query, (qb) => {
      if (query?.name) {
        qb.andWhere('LOWER(gifticon.name) LIKE LOWER(:name)', {
          name: `%${query?.name}%`,
        });
      }

      if (query?.description) {
        qb.andWhere('gifticon.description LIKE :description', {
          description: `%${query?.description}%`,
        });
      }

      if (query?.eventId) {
        qb.andWhere('gifticon.eventId = :eventId', {
          eventId: `${query?.eventId}`,
        });
      }

      if (query?.userId) {
        qb.andWhere('gifticon.userId = :userId', {
          userId: `${query?.userId}`,
        });
      }

      if (query?.claimedBy) {
        qb.andWhere('gifticon.claimedBy = :claimedBy', {
          claimedBy: `${query?.claimedBy}`,
        });
      }

      return qb;
    });
    return result;
  }
}
