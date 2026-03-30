import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

// TRACED: AE-AUTH-002
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

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  @IsString()
  @MaxLength(20)
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
