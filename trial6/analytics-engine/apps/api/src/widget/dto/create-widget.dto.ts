// TRACED:AE-API-004 — DTO validation with class-validator decorators
import { IsString, MaxLength, IsIn, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateWidgetDto {
  @IsIn(['LINE', 'BAR', 'PIE', 'AREA', 'KPI', 'TABLE', 'FUNNEL'])
  type!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsUUID()
  dashboardId!: string;
}
