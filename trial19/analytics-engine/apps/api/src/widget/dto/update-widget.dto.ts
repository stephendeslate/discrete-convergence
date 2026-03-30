import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  @MaxLength(20)
  type?: string;

  @IsString()
  @IsOptional()
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
  @Max(24)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  height?: number;
}
