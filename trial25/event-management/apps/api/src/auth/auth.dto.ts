// TRACED:EM-AUTH-001 TRACED:EM-AUTH-005 TRACED:EM-AUTH-008
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  tenantId?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'ORGANIZER', 'VIEWER'])
  @MaxLength(20)
  role?: 'ADMIN' | 'ORGANIZER' | 'VIEWER';
}

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MaxLength(2048)
  refreshToken!: string;
}
