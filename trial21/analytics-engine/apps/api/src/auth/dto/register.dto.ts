import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

/**
 * VERIFY: AE-AUTH-003 — registration DTO with role restriction
 */
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
  @MaxLength(255)
  tenantName!: string;

  @IsString()
  @IsIn([...ALLOWED_REGISTRATION_ROLES]) // TRACED: AE-AUTH-003
  @MaxLength(36)
  role!: string;
}
