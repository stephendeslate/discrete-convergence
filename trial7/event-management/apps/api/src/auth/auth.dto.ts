import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

// TRACED:EM-AUTH-001
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

// TRACED:EM-AUTH-002
export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
