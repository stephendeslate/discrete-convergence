import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @MaxLength(20)
  type!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  connectionString?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  config?: string;
}
