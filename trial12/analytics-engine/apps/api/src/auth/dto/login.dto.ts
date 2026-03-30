import { IsString, IsEmail, MaxLength } from 'class-validator';

// TRACED: AE-AUTH-007
export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
