import { IsString, IsEmail, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsString()
  @MaxLength(36)
  companyId!: string;
}
