import { IsString, MaxLength, IsOptional, IsBoolean } from 'class-validator';

// TRACED: AE-DASH-001
export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
