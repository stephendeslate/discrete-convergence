import { IsString, MaxLength, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { WidgetType } from '@prisma/client';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsEnum(WidgetType)
  type!: WidgetType;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  positionY?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  width?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  height?: number;
}
