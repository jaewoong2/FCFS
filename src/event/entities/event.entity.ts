import { Basic } from 'src/core/entities/basic.entitiy';
import { Entity, Column } from 'typeorm';

@Entity('events')
export class Event extends Basic {
  @Column({ type: 'varchar', nullable: false, unique: true })
  eventName: string;

  @Column({ type: 'timestamp', nullable: true })
  eventDate: Date;
}
