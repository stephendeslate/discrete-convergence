// TRACED:AE-API-004 — DTO validation with class-validator decorators
import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;
}
