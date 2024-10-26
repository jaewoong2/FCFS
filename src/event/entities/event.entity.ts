import { Basic } from 'src/core/entities/basic.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity('events')
export class Event extends Basic {
  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', nullable: false, unique: true })
  eventName: string;

  @Column({ type: 'varchar', nullable: true })
  eventDescription: string;

  @Column({ type: 'timestamp', nullable: true })
  eventStartDate: Date; // 이벤트 시작 날짜

  @Column({ type: 'timestamp', nullable: true })
  eventEndDate: Date; // 이벤트 종료 날짜

  @Column({ type: 'int', nullable: false })
  maxParticipants: number; // 선착순 가능 인원 수

  @Column({ type: 'int', nullable: true })
  totalGifticons: number; // 총 기프티콘 수
}
