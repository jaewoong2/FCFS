// src/users/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AuthProvider } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  avatar?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  userName?: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsEnum(AuthProvider)
  @IsOptional()
  provider: AuthProvider;
}
