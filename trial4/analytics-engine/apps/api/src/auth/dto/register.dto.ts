import { IsEmail, IsString, MaxLength, IsIn, MinLength } from 'class-validator';
// TRACED:AE-SEC-003 — registration uses ALLOWED_REGISTRATION_ROLES (ADMIN excluded)
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  @MinLength(8)
  password!: string;

  @IsString()
  @MaxLength(50)
  name!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: (typeof ALLOWED_REGISTRATION_ROLES)[number];
}
