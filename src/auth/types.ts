import { AuthProvider } from 'src/users/entities/user.entity';

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  photo: string;
  userName?: string;
}

export interface JwtPayload {
  id: number | string;
  email: string;
  userName: string;
  provider: AuthProvider;
}

export interface LoginResponse {
  id: number | string;
  userName: string;
  access_token: string;
}
