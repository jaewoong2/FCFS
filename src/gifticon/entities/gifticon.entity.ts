import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { Basic } from 'src/core/entities/basic.entitiy';
import { GifticonCategory } from '../enums/gifticon-category.enum';
import { Image } from 'src/images/entities/image.entity';

@Entity('gifticons')
export class Gifticon extends Basic {
  @OneToOne(() => Image, (image) => image.gifticon, { cascade: true })
  @JoinColumn({ name: 'imageId' })
  image: Image;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'enum',
    enum: GifticonCategory,
    default: GifticonCategory.FOOD,
  })
  category: GifticonCategory;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  message: string;

  @Column({ type: 'boolean', default: false })
  isClaimed: boolean;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'claimedBy' })
  claimedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt: Date;
}
