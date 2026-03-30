import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';
import type { AllowedRegistrationRole } from '@fleet-dispatch/shared';

// TRACED: FD-AUTH-003
// TRACED: FD-AUTH-004
// TRACED: FD-API-007
export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsString()
  @MaxLength(20)
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: AllowedRegistrationRole;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
