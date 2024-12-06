import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

// kakaoNativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
// kakaoRestApiKey: process.env.KAKAO_REST_API_KEY,
// kakakoJavascriptKey: process.env.KAKAO_JAVASCRIPT_KEY,
// kaKaoAdminKey: process.env.KAKAO_ADMIN_KEY,
// kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI,
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    console.log(process.env.KAKAO_REST_API_KEY);
    console.log(process.env.KAKAO_SECRET_KEY);
    console.log(process.env.KAKAO_REDIRECT_URI);
    super({
      clientID: process.env.KAKAO_REST_API_KEY,
      clientSecret: process.env.KAKAO_SECRET_KEY,
      callbackURL: process.env.KAKAO_REDIRECT_URI,
      scope: ['profile_image', 'profile_nickname'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('🚀 🔶 KaKaoStorategy 🔶 validate 🔶 profile:', profile);
    console.log('accessToken: ', accessToken);
    console.log('refreshToken: ', refreshToken);
    console.log(profile);
    console.log('🚀 🔶 KaKaoStorategy 🔶 validate 🔶 profile:', profile);

    return {
      email: profile.displayName,
      password: String(profile.id),
      nickname: profile.displayName,
      image: profile._json.properties.thumbnail_image,
    };
  }
}
