import { IsEmail, IsString, MinLength, IsIn, IsUUID } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@repo/shared';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role: string;

  @IsUUID()
  companyId: string;
}
