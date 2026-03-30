import { IsString, MaxLength, IsOptional, IsIn, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsIn(['LINE', 'BAR', 'PIE', 'AREA', 'KPI', 'TABLE', 'FUNNEL'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
