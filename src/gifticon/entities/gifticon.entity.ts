import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('gifticons')
export class Gifticon {
  @Column({ type: 'varchar', unique: true })
  imageUrl: string;

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
