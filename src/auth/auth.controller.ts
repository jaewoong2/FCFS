import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/auth.guard';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api/auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('oauth2/redirect/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const token = await this.authService.googleLogin(req);
    res.cookie('access_token', token.access_token, { httpOnly: true });
    res.redirect(`http://localhost:3000/login?code=${token.access_token}`);
  }

  @Post('signup')
  async signUp(
    @Req() req: Request,
    @Body()
    signUpDto: {
      email: string;
      avatar: string;
      userName: string;
    },
  ) {
    const result = await this.authService.googleLogin({
      user: {
        email: signUpDto.email,
        userName: signUpDto.userName,
        photo: signUpDto.avatar,
      },
    });

    return result;
  }

  @Post('login')
  @UseGuards(JwtAuthGuard)
  async login(@Req() request: { user: User }) {
    const user = await this.authService.validateUser(request.user.userName);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
