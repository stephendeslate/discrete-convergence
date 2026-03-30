import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(['BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'KPI'])
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;
}
