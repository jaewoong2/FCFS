import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Image } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async updateImage(callback: (repositroy?: Repository<Image>) => Image) {
    const image = callback(this.imageRepository);

    const result = await this.imageRepository.save(image);

    return result;
  }

  async create(property: Partial<Image>) {
    const repository = this.imageRepository;
    const image = repository.create({
      ...property,
    });

    const result = await repository.save(image);

    return result;
  }

  async findOrCreate(
    { where }: { where: FindOptionsWhere<Image> | FindOptionsWhere<Image>[] },
    property: Partial<Image>,
  ) {
    // Use the manager if provided, otherwise default to imageRepository
    const repository = this.imageRepository;

    const image = await repository.findOne({
      where,
      relations: ['event', 'gifticon'],
    });

    if (!image) {
      const image = repository.create({
        ...property,
      });

      const result = await repository.save(image);

      return result;
    }

    return image;
  }

  async deleteImage(image: Image) {
    const result = await this.imageRepository.softRemove({ id: image.id });
    return result;
  }
}
