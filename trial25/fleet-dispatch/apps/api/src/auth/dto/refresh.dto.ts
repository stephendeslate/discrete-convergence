// TRACED:FD-AUTH-003 — Refresh token DTO
import { IsString, MaxLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  @MaxLength(1024)
  refreshToken!: string;
}
