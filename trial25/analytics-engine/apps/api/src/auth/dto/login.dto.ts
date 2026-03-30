// TRACED:AUTH-DTO-LOGIN — Login DTO
// TRACED:AUTH-THROTTLE-LOGIN — login endpoint rate-limited by global ThrottlerGuard (VERIFY:AUTH-THROTTLE-LOGIN)
import { IsEmail, IsString, MaxLength } from 'class-validator';

/**
 * TRACED:AE-AUTH-DTO-002 — Login DTO with validation
 */
export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
