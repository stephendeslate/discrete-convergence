import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

// TRACED: AE-DASH-001
export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;
}
