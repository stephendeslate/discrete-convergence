import { IsString, IsEmail, IsIn, MaxLength } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';

// TRACED:FD-AUTH-004 — Registration DTO with ALLOWED_REGISTRATION_ROLES validation
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

  @IsString()
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;

  @IsString()
  @MaxLength(36)
  companyId!: string;
}
