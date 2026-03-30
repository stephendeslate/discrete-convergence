// TRACED:EM-AUTH-005 — registration DTO with ALLOWED_REGISTRATION_ROLES validation
import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: string;

  @IsString()
  @MaxLength(36)
  organizationId!: string;
}
