import { IsEmail, IsString, MaxLength } from 'class-validator';

// TRACED: FD-API-009
export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(255)
  password!: string;
}
