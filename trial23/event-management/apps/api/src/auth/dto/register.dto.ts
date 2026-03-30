import { IsString, MinLength, MaxLength, IsIn } from 'class-validator';
import { ALLOWED_REGISTRATION_ROLES } from '@repo/shared';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsIn([...ALLOWED_REGISTRATION_ROLES])
  @IsString()
  role!: string;
}
