import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

// TRACED:EM-AUD-001
export class CreateAuditLogDto {
  @IsIn(['CREATE', 'UPDATE', 'DELETE', 'LOGIN'])
  @IsString()
  @MaxLength(20)
  action!: string;

  @IsString()
  @MaxLength(100)
  entity!: string;

  @IsString()
  @MaxLength(36)
  entityId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}
