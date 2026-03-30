import { IsString, MaxLength, IsOptional, IsInt, Min, IsIn } from 'class-validator';

export class UpdateWidgetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CHART', 'TABLE', 'METRIC', 'MAP'])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
