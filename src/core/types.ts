import { Request } from 'express';

export interface AuthRedirectRequestType<T = Map<string, string>>
  extends Request {
  user: T;
}

export interface KaKaoRedirectRequestType
  extends AuthRedirectRequestType<{
    nickname: string;
    image: string;
  }> {}

export interface GoogleRedirectRequestType
  extends AuthRedirectRequestType<{
    email: string;
    firstName: string;
    lastName: string;
    photo: string;
  }> {}
