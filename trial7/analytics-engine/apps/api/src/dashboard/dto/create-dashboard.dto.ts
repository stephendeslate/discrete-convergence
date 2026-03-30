import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

// TRACED:AE-DASH-001
export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  title!: string;

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
