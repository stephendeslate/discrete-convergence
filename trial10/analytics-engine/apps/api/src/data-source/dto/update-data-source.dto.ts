import { IsString, MaxLength, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @IsString()
  @MaxLength(20)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  connectionUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
