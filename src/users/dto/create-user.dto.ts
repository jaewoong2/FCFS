// src/users/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
