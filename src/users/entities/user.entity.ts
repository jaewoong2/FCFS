import { Entity, Column } from 'typeorm';
import { Basic } from 'src/core/entities/basic.entitiy';
import { ApiProperty } from '@nestjs/swagger';

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
}
