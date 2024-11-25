import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from 'src/aws/s3.service';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';

@Controller('api/images')
export class ImagesController {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.s3Service.uploadImage(file);

    const image = this.imageRepository.create({ imageUrl: url, name: url });
    await this.imageRepository.save(image);

    return { url };
  }
}
