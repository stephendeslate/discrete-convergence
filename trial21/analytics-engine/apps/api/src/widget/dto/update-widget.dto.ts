import { IsString, MaxLength, IsOptional, IsInt, Min, Max, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
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
