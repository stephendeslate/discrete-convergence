// TRACED:AUTH-DTO-REFRESH — Refresh DTO
import { IsString, MaxLength } from 'class-validator';

/**
 * TRACED:AE-AUTH-DTO-003 — Refresh token DTO
 */
export class RefreshDto {
  @IsString()
  @MaxLength(2048)
  refreshToken!: string;
}
