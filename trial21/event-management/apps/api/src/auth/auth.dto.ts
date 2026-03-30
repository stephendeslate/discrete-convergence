import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

/** TRACED:EM-SEC-009 — Login DTO with validated fields */
export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

/** TRACED:EM-SEC-010 — Register DTO with role validation */
export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MaxLength(36)
  organizationId!: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;
}

export class RefreshDto {
  @IsString()
  @MaxLength(2048)
  refreshToken!: string;
}
