import { Basic } from 'src/core/entities/basic.entitiy';
import { Entity, Column } from 'typeorm';

@Entity('events')
export class Event extends Basic {
  @Column({ type: 'varchar', nullable: false, unique: true })
  eventName: string;

  @Column({ type: 'timestamp', nullable: true })
  eventDate: Date;

  @Column({ type: 'int', nullable: false })
  maxParticipants: number; // 선착순 가능 인원 수

  @Column({ type: 'int', nullable: false })
  totalGifticons: number; // 총 기프티콘 수
}
