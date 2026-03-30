// TRACED: FD-AUTH-006
import { IsString, IsEmail, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@fleet-dispatch/shared';

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

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  @IsString()
  @MaxLength(20)
  role!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;
}
