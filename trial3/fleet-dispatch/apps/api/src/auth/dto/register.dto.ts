import {
  IsString,
  IsEmail,
  IsIn,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';
import type { AllowedRegistrationRole } from '@fleet-dispatch/shared';

// TRACED:FD-AUTH-004
export class RegisterDto {
  @IsEmail()
  @IsString()
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

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: AllowedRegistrationRole;

  @IsString()
  @MaxLength(36)
  companyId!: string;
}
