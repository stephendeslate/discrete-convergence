// TRACED:FD-AUTH-003 — registration DTO with role validation
import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';

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

  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  @IsString()
  @MaxLength(20)
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
