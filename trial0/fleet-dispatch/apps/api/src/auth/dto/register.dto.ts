// TRACED:FD-DTO-001
import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from 'shared';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  role!: string;
}
