import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { authConfig } from 'src/core/config/auth.config';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(authConfig.KEY)
    private readonly configService: ConfigType<typeof authConfig>,
  ) {
    super({
      clientID: configService.auth.google.client_id,
      clientSecret: configService.auth.google.client_secret,
      callbackURL: '/api/auth/oauth2/redirect/google', // 이 부분은 구글 콘솔에서 설정한대로. 승인된 리디렉션 URI
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    try {
      const { name, emails, photos } = profile;
      console.log('🚀 🔶 GoogleStrategy 🔶 validate 🔶 profile:', profile);
      const user = {
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
        photo: photos[0].value,
      };
      console.log('🚀 🔶 GoogleStrategy 🔶 validate 🔶 user:', user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
