import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

// TRACED: AE-DS-001
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  type!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2048)
  connectionString?: string;
}
