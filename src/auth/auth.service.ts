// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';
import { JwtPayload } from './interface/auth.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmailOrSave(
    email: string,
    fullName: string,
    avatar: string,
  ): Promise<User> {
    try {
      const foundUser = await this.userRepository.findOne({
        where: { email },
      });

      if (foundUser) return foundUser;

      const result = await this.usersService.createUser({
        email,
        userName: fullName,
        avatar,
      });
      console.log(result);

      return result;
    } catch (error) {
      console.error(error);
      throw new Error('사용자를 찾거나 생성하는데 실패하였습니다');
    }
  }

  async googleLogin(req): Promise<any> {
    const { email, firstName, lastName, photo, userName } = req.user;

    const fullName = userName ? userName : firstName + lastName;

    const user: User = await this.findByEmailOrSave(email, fullName, photo); // 이메일로 가입된 회원을 찾고, 없다면 회원가입

    // JWT 토큰에 포함될 payload
    const payload = {
      id: user.id,
      email: user.email,
      userName: user.userName,
    };

    return {
      id: user.id,
      userName: user.userName,
      access_token: this.jwtService.sign(payload),
    };
  }

  async signUp(
    avartar: string,
    email: string,
    userName: string,
  ): Promise<{ access_token: string }> {
    const user = new User();
    user.avatar = avartar;
    user.userName = userName;
    user.email = email;
    const result = await this.usersService.createUser(user);

    const payload = { userName: user.userName, id: user.id, email: user.email };

    return {
      ...result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(userName: string): Promise<User | null> {
    const user = await this.usersService.findOneByUserName(userName);

    if (user) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { userName: user.userName, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOneByUserName(payload.userName);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
