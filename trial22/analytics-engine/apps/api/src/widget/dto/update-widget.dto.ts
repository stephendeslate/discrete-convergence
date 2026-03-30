import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  config?: string;

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
