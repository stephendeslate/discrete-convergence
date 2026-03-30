import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

// TRACED: AE-WID-001
export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'TEXT'])
  type!: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  config?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  positionX?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  positionY?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  width?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  height?: number;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(36)
  dataSourceId?: string;
}
