import { ApiProperty } from '@nestjs/swagger';
import { ResponseFormat } from 'src/core/dto/response-format.dto';

export abstract class CreateUserResponseData {
  @ApiProperty()
  avatar: string = 'https://images.prlc.kr/resized/images/jeans.png';
  @ApiProperty()
  userName: string = '홍길동';
  @ApiProperty()
  email: string = 'example@gmail.com';
  @ApiProperty()
  access_token: string =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6IkFkbWluVGVzdDIiLCJpYXQiOjE3MjMzNTM3MTYsImV4cCI6MTcyMzk1ODUxNn0.xadZWJpI5vy6JA7U5nWSSxSEa4dxxgouECVXDuoCFVw';
}

export abstract class CreateUserResponse extends ResponseFormat<CreateUserResponseData> {
  constructor() {
    super();
  }

  data: CreateUserResponseData;
}
