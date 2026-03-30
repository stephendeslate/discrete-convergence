import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

// TRACED:AE-DS-001
export class CreateDataSourceDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @MaxLength(20)
  type!: string;

  @IsString()
  @MaxLength(2000)
  connectionUrl!: string;

  @IsString()
  @IsOptional()
  @IsIn(['CONNECTED', 'DISCONNECTED', 'ERROR'])
  @MaxLength(20)
  status?: string;
}
