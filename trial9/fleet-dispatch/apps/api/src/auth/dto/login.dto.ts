import { IsEmail, IsString, MaxLength } from 'class-validator';

// TRACED: FD-AUTH-006
export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
