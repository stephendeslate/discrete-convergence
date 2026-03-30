// TRACED:AUTH-DTO — Validation DTOs for auth endpoints
import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsUUID()
  tenantId!: string;
}
