import { IsEmail, IsString, MaxLength, IsIn, IsOptional } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES, AllowedRegistrationRole } from '@repo/shared';

// TRACED: EM-AUTH-002
export class RegisterDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  role?: AllowedRegistrationRole;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  tenantId?: string;
}
