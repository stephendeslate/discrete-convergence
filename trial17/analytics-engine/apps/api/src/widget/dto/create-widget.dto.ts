import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsIn(['BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'KPI'])
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;
}
