import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;
}

export class UpdateWidgetPositionDto {
  @IsInt()
  @Min(0)
  positionX!: number;

  @IsInt()
  @Min(0)
  positionY!: number;

  @IsInt()
  @Min(1)
  width!: number;

  @IsInt()
  @Min(1)
  height!: number;
}
