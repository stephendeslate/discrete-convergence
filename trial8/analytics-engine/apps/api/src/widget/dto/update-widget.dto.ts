import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  type?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
