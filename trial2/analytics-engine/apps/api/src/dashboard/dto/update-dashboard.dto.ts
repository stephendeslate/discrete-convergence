import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
