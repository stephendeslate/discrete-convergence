import { IsEmail, IsIn, IsString, MaxLength } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';

// TRACED:FD-AUTH-001
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
  name!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  @IsString()
  @MaxLength(20)
  role!: string;
}
