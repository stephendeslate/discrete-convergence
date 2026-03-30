import { IsString, MaxLength, IsIn, IsOptional } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @MaxLength(20)
  type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  connectionUrl?: string;

  @IsString()
  @IsOptional()
  @IsIn(['CONNECTED', 'DISCONNECTED', 'ERROR'])
  @MaxLength(20)
  status?: string;
}
