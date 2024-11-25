import { Exclude, Type } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { Participant } from '../entities/participant.entity';
import { Image } from 'src/images/entities/image.entity';

class UserDto extends User {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;
}

class ParticipantDto extends Participant {
  @Exclude()
  createdAt: Date;

  @Exclude()
  updateAt: Date;
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
  @Type(() => UserDto)
  user: UserDto;
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];
  thumbnails: Image[];
}
