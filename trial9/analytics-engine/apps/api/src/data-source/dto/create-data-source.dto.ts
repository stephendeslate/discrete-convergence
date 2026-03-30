import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  connectionString?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  config?: string;
}
