import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['BAR_CHART', 'LINE_CHART', 'PIE_CHART', 'TABLE', 'KPI', 'SCATTER_PLOT'])
  @IsString()
  @MaxLength(20)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  positionY?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  height?: number;
}
