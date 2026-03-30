import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @IsString()
  @MaxLength(20)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  connectionString?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'ERROR', 'CONNECTING'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
