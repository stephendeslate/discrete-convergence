import { IsString, MaxLength, IsIn, IsOptional, IsObject } from 'class-validator';

// TRACED:AE-AUDIT-001
export class CreateAuditLogDto {
  @IsString()
  @IsIn(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'])
  @MaxLength(20)
  action!: string;

  @IsString()
  @MaxLength(100)
  entity!: string;

  @IsString()
  @IsOptional()
  @MaxLength(36)
  entityId?: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, unknown>;
}
