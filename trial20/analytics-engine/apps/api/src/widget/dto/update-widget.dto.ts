import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'TEXT'])
  type?: string;

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
  @IsOptional()
  @MaxLength(36)
  dataSourceId?: string;
}
