import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';
import { DashboardStatus } from '@prisma/client';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: DashboardStatus;
}
