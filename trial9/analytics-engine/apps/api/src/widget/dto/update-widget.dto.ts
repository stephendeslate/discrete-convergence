import { IsString, MaxLength, IsOptional, IsIn, IsNumber } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsIn(['BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'KPI', 'METRIC_CARD'])
  @IsString()
  @MaxLength(20)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}
