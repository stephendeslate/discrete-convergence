import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  @MaxLength(20)
  type!: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  config?: string;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(36)
  dataSourceId?: string;

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
  @Max(24)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  height?: number;
}
