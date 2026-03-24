import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @IsIn(['LINE', 'BAR', 'PIE', 'AREA', 'KPI', 'TABLE', 'FUNNEL'])
  type!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  config?: Record<string, unknown>;
}
