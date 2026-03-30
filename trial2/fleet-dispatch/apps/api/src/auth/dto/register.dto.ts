import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { UserRole } from '@prisma/client';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';

/**
 * TRACED:FD-AUTH-003
 */
export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MaxLength(36)
  companyId!: string;

  @IsString()
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: UserRole;
}
