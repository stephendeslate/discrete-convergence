// TRACED:AE-AUTH-002 — Registration role restriction using ALLOWED_REGISTRATION_ROLES from shared
// TRACED:AE-API-004 — DTO validation with class-validator decorators
import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

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
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
