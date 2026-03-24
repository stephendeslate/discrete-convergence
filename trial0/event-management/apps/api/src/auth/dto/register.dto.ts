// TRACED:EM-DTO-001 — Registration DTO with all required validators
import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  role!: string;
}
