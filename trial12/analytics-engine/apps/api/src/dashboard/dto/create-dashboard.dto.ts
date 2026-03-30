import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

// TRACED: AE-DASH-001
export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
