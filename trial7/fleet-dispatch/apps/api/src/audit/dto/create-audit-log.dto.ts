import { IsString, MaxLength, IsOptional } from 'class-validator';

// TRACED:FD-AUD-001
export class CreateAuditLogDto {
  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(36)
  userId!: string;

  @IsString()
  @MaxLength(100)
  action!: string;

  @IsString()
  @MaxLength(100)
  entity!: string;

  @IsString()
  @MaxLength(36)
  entityId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  metadata?: string;
}
