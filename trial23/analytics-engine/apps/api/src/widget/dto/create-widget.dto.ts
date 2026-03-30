import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsString()
  @MaxLength(36)
  dashboardId!: string;

  @IsOptional()
  @IsString()
  config?: string;
}
