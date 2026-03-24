// TRACED:AE-DTO-001 — Registration DTO with all required validators
import { IsString, IsEmail, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
