import { IsString, MaxLength, IsIn, IsInt, Min, IsOptional } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsIn(['LINE_CHART', 'BAR_CHART', 'PIE_CHART', 'TABLE', 'KPI'])
  @MaxLength(20)
  type!: string;

  @IsString()
  @MaxLength(5000)
  config!: string;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsString()
  @MaxLength(36)
  dataSourceId!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  positionX?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  positionY?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  width?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  height?: number;
}
