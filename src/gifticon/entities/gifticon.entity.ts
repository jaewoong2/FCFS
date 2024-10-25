import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { User } from 'src/users/entities/user.entity';
import { Basic } from 'src/core/entities/basic.entitiy';

@Entity('gifticons')
export class Gifticon extends Basic {
  @Column({ type: 'varchar', unique: true })
  imageUrl: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isClaimed: boolean;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'claimedBy' })
  claimedBy: User;

  @Column({ type: 'timestamp', nullable: true })
  claimedAt: Date;
}
