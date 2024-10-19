import { Basic } from 'src/core/entities/basic.entitiy';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity('gifticon_request_logs')
export class GifticonRequestLog extends Basic {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Gifticon)
  @JoinColumn({ name: 'gifticon_id' })
  gifticon: Gifticon;

  @Column({ type: 'timestamp', nullable: false })
  request_time: Date;
}
