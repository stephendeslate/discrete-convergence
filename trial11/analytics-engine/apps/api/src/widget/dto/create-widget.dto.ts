import { IsString, MaxLength, IsOptional, IsInt, Min, IsIn } from 'class-validator';

// TRACED: AE-WID-001
export class CreateWidgetDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  type!: string;

  @IsString()
  @MaxLength(5000)
  config!: string;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsString()
  @MaxLength(36)
  dataSourceId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
