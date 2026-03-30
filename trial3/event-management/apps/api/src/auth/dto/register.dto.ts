// TRACED:EM-AUTH-005
import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsIn,
  IsUUID,
} from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

type AllowedRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];

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

  @IsIn(ALLOWED_REGISTRATION_ROLES)
  role!: AllowedRole;

  @IsUUID()
  @MaxLength(36)
  organizationId!: string;
}
