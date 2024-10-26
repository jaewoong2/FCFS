import { Entity, Column, OneToMany } from 'typeorm';
import { Basic } from 'src/core/entities/basic.entitiy';
import { ApiProperty } from '@nestjs/swagger';
import { Event } from 'src/event/entities/event.entity';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';

@Entity()
export class User extends Basic {
  @ApiProperty()
  @Column()
  avatar: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  userName: string;

  @OneToMany(() => Event, (event) => event.user, {
    cascade: true,
    nullable: true,
  })
  events: Event[];

  @OneToMany(() => Gifticon, (gifticon) => gifticon.user, {
    cascade: true,
    nullable: true,
  })
  gifticons: Gifticon[];
}
