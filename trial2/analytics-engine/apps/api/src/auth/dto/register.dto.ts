import { IsEmail, IsString, MaxLength, IsIn, IsOptional } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';

// TRACED:AE-AUTH-001 — Registration DTO with role validation excluding ADMIN
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
  name!: string;

  @IsString()
  @MaxLength(100)
  tenantName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  role?: string;
}
