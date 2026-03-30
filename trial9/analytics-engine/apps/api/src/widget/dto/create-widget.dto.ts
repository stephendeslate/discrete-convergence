import { IsString, MaxLength, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsIn(['BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'KPI', 'METRIC_CARD'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
