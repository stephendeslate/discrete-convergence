import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  @MaxLength(20)
  status?: string;
}
