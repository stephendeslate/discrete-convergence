import { IsString, IsOptional, IsInt, IsEnum, MaxLength, Min } from 'class-validator';

enum WidgetType {
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  AREA_CHART = 'AREA_CHART',
  KPI_CARD = 'KPI_CARD',
  TABLE = 'TABLE',
  FUNNEL = 'FUNNEL',
}

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsOptional()
  @IsString()
  config?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionY?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
