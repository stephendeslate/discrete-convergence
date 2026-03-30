import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * VERIFY: AE-AUTH-002 — login DTO validation
 */
export class LoginDto {
  @IsEmail() // TRACED: AE-AUTH-011
  @IsString()
  @MaxLength(255)
  email!: string; // TRACED: AE-AUTH-002

  @IsString()
  @MinLength(8) // TRACED: AE-AUTH-010
  @MaxLength(128)
  password!: string;
}
