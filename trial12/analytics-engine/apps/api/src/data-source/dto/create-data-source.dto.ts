import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

// TRACED: AE-DS-001
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  connectionString?: string;
}
