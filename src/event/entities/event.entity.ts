import { Basic } from 'src/core/entities/basic.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Participant } from './participant.entity';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Image } from 'src/images/entities/image.entity';

@Index('unique_index', ['eventName'], {
  where: 'deleted_at IS NULL',
  unique: true,
})
@Entity('events')
export class Event extends Basic {
  @ManyToOne(() => User, (user) => user.events, {
    nullable: false,
  })
  user: User;

  @OneToMany(() => Participant, (participant) => participant.event, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: ['soft-remove', 'recover'],
  })
  participants: Participant[];

  @OneToMany(() => Gifticon, (gifticon) => gifticon.event, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: ['soft-remove'],
  })
  gifticons: Gifticon[];

  @Column({ type: 'varchar', nullable: false })
  eventName: string;

  @Column({ type: 'varchar', nullable: true })
  eventDescription: string;

  @Column({ type: 'timestamp', nullable: false, default: new Date() })
  eventStartDate: Date; // 이벤트 시작 날짜

  @Column({ type: 'timestamp', nullable: false, default: new Date() })
  eventEndDate: Date; // 이벤트 종료 날짜

  @Column({ type: 'int', nullable: false, default: 100 })
  maxParticipants: number; // 선착순 가능 인원 수

  @Column({ type: 'int', nullable: false, default: 0 })
  totalGifticons: number; // 총 기프티콘 수

  @Column({ type: 'int', nullable: false, default: 1 })
  repetition: number; // 총 가능 한 당첨 횟수

  @OneToMany(() => Image, (image) => image.event, {
    onDelete: 'CASCADE',
    cascade: ['soft-remove', 'recover'],
  })
  thumbnails: Image[];
}
