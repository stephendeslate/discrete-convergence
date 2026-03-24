import { IsString, MaxLength, IsIn, IsOptional, IsInt, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsIn(['LINE', 'BAR', 'PIE', 'DONUT', 'AREA', 'KPI', 'TABLE', 'FUNNEL'])
  chartType?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  gridColumn?: number;

  @IsOptional()
  @IsInt()
  gridRow?: number;

  @IsOptional()
  @IsInt()
  gridWidth?: number;

  @IsOptional()
  @IsInt()
  gridHeight?: number;
}
