import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES, AllowedRegistrationRole } from '@fleet-dispatch/shared';

// TRACED: FD-AUTH-001
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
  @MaxLength(50)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: AllowedRegistrationRole;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
