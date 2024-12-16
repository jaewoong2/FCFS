import { Exclude, Type } from 'class-transformer';
import { AuthProvider, User } from 'src/users/entities/user.entity';
import { Participant } from '../entities/participant.entity';
import { Image } from 'src/images/entities/image.entity';
import { Gifticon } from 'src/gifticon/entities/gifticon.entity';
import { Event } from '../entities/event.entity';

class GifticonDto extends Gifticon {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  image: Image;

  @Exclude()
  claimedAt: Date;
  @Exclude()
  claimedBy: User;
  @Exclude()
  description: string;
  @Exclude()
  event: Event;
  @Exclude()
  message: string;
  @Exclude()
  isClaimed: boolean;
  @Exclude()
  name: string;
  @Exclude()
  user: User;
}

class UserDto extends User {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;

  @Exclude()
  gifticons: Gifticon[];

  @Exclude()
  provider: AuthProvider;

  @Exclude()
  claimedGifticons: Gifticon[];

  @Exclude()
  email: string;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  id: number;
}

class ParticipantDto extends Participant {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  event: Event;

  @Exclude()
  participatedAt: Date;
}

export class GetEventResponseDto {
  id: string;
  eventName: string;
  eventDescription: string;
  eventStartDate: Date;
  eventEndDate: Date;
  maxParticipants: number;
  totalGifticons: number;
  createdAt: string;
  updateAt: string;
  @Type(() => GifticonDto)
  gifticons: Gifticon[];
  @Type(() => UserDto)
  user: UserDto;
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];
  thumbnails: Image[];
}
