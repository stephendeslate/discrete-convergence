import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  type!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
