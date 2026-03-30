// TRACED:EM-AUTH-002 — Registration DTO with class-validator decorators and role whitelist
// TRACED:EM-API-004 — DTO validation with class-validator decorators
import { IsEmail, IsString, MinLength, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;
}
