import { IsString, MaxLength, IsOptional, IsIn, IsNumber, IsObject, Min, Max } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  @MaxLength(20)
  type?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  positionX?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  positionY?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(24)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(24)
  height?: number;

  @IsNumber()
  @IsOptional()
  @Min(5)
  refreshRate?: number;
}
