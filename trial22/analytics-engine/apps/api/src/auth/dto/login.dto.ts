import { IsString, IsEmail, MaxLength } from 'class-validator';

// TRACED: AE-AUTH-002
export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;
}
