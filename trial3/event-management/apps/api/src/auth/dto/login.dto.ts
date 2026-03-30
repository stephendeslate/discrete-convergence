import { IsString, IsEmail, MaxLength, IsUUID } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;

  @IsUUID()
  @MaxLength(36)
  organizationId!: string;
}
