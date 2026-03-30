import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

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
  @IsIn(['ACTIVE', 'DRAFT', 'ARCHIVED'])
  @MaxLength(20)
  status?: string;
}
