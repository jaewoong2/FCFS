import { Injectable } from '@nestjs/common';
import { Gifticon } from './entities/gifticon.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class GifticonService {
  constructor(
    @InjectRepository(Gifticon)
    private readonly gifitconRepository: Repository<Gifticon>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}
}
