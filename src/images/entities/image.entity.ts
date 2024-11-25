import { Entity, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { Basic } from 'src/core/entities/basic.entitiy';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';

@Entity('images')
export class Image extends Basic {
  @Column({ type: 'varchar', unique: false })
  imageUrl: string;

  @Column({ type: 'varchar', unique: false })
  name: string;

  @ManyToOne(() => Event, (event) => event.thumbnails, { nullable: true })
  event: Event;

  @OneToOne(() => Gifticon, (gifticon) => gifticon.image, { nullable: true })
  @JoinColumn({ name: 'gifticonId' })
  gifticon: Gifticon;
}
