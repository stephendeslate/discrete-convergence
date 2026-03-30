// TRACED:AE-AUTH-004 — registration DTO with ALLOWED_REGISTRATION_ROLES
import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(255)
  tenantName!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  @IsString()
  @MaxLength(20)
  role!: string;
}
