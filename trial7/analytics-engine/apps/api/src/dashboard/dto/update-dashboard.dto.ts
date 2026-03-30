import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'ARCHIVED', 'DRAFT'])
  @MaxLength(20)
  status?: string;
}
