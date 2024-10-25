import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from 'src/users/entities/user.entity';
import { Basic } from 'src/core/entities/basic.entitiy';

@Entity('participants')
@Unique(['event', 'user']) // Ensure uniqueness for the event-user combination
export class Participant extends Basic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp', nullable: false })
  participatedAt: Date;

  @Column({ type: 'boolean', default: false })
  gifticonIssued: boolean;

  @Column({ type: 'boolean', default: false })
  isApply: boolean;
}
