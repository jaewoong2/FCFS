import { Entity, Column, OneToMany } from 'typeorm';
import { Basic } from 'src/core/entities/basic.entitiy';
import { ApiProperty } from '@nestjs/swagger';
import { Event } from 'src/event/entities/event.entity';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';

export enum AuthProvider {
  GOOGLE = 'google',
  EMAIL = 'email',
  GITHUB = 'github',
  APPLE = 'apple',
}

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

  @ApiProperty({
    enum: AuthProvider,
    description: 'Authentication provider',
    example: AuthProvider.EMAIL,
  })
  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.EMAIL,
  })
  provider: AuthProvider;

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

  @OneToMany(() => Gifticon, (gifticon) => gifticon.claimedBy, {
    cascade: true,
    nullable: true,
  })
  claimedGifticons: Gifticon[];
}
