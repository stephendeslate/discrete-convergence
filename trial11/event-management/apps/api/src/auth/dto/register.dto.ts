import { IsEmail, IsString, MaxLength, MinLength, IsOptional, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

// TRACED: EM-AUTH-006
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
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role?: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
