import { IsString, MaxLength, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  @IsString()
  @MaxLength(20)
  type!: string;

  @IsString()
  @MaxLength(500)
  connectionUrl!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
