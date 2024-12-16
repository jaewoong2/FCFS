import { Basic } from 'src/core/entities/basic.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { Participant } from './participant.entity';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Image } from 'src/images/entities/image.entity';
import { Block } from '../types';

const DEFAULT_BLOCKS = [
  {
    id: '1234-5678-9abc-def0',
    type: 'auto-checkbox',
    content: {
      texts: [
        '밤톨이에 오신걸 환영 합니다 :)',
        '밤톨이에서 이벤트를 만들고 행복을 나눌 수 있어요',
        '이벤트 만들고 선물을 준비를 해보시는건 어떨까요',
        '이벤트에 참여해주셔서 너무 감사해요',
        '참여하시고, 설문 작성도 꼭 부탁 드려요:)',
      ],
    },
    createdAt: '2024-11-29T19:00:00.000Z',
    updatedAt: '2024-11-29T19:00:00.000Z',
  },
  {
    id: '1234',
    type: 'cta-button',
    content: {
      texts: ['이벤트 참여하기'],
      time: 5000,
    },
    createdAt: '2024-11-29T19:00:00.000Z',
    updatedAt: '2024-11-29T19:00:00.000Z',
  },
];

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

  @Column({
    type: 'jsonb',
    nullable: true,
    default: DEFAULT_BLOCKS,
  })
  blocks: Block[];
}
