import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeUpdate,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from 'src/users/entities/user.entity';
import { Basic } from 'src/core/entities/basic.entitiy';

@Entity('participants')
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
  isApply: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    default: () => `now() + interval '1 minute'`,
  })
  expiresAt?: Date;

  @BeforeUpdate()
  setExpiresAt() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    this.expiresAt = now;
  }
}
