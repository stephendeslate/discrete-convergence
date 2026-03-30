import { IsString, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridColumn?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  gridRow?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridWidth?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridHeight?: number;
}
