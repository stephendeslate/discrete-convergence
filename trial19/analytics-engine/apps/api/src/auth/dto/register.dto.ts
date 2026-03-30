import { IsString, IsEmail, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

// TRACED: AE-AUTH-003
// TRACED: AE-EDGE-001 — @IsEmail rejects empty/invalid emails
// TRACED: AE-EDGE-002 — @MinLength(8) + @MaxLength(128) on password
// TRACED: AE-EDGE-011 — forbidNonWhitelisted strips/rejects extra fields
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
  name!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  @IsString()
  @MaxLength(20)
  role!: string;
}
