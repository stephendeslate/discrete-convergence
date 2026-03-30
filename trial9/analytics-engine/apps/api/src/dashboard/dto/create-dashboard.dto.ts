import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  title!: string;

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
