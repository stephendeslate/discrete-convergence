// TRACED: AE-EDGE-010 — Login with malformed email rejected
// TRACED: AE-EDGE-012 — Access protected route without token

import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(128)
  password!: string;
}
