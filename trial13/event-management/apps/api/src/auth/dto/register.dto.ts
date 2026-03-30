import { IsEmail, IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

// TRACED: EM-AUTH-003
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
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsIn(ALLOWED_REGISTRATION_ROLES as unknown as string[])
  @IsString()
  @MaxLength(20)
  role!: string;
}
