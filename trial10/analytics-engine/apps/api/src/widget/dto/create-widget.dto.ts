import { IsString, MaxLength, IsOptional, IsIn, IsInt, Min } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  dataSourceId?: string;
}
