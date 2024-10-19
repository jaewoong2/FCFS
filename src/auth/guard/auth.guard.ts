// src/auth/jwt/jwt.guard.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context, status) {
    if (err || !user) {
      // 사용자 정의 에러 메시지
      throw new UnauthorizedException({
        status: status,
        message: `로그인 후 이용 가능 합니다.`,
        description: info.message,
      });
    }
    return user;
  }
}
