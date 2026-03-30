import { IsString, MaxLength, IsIn, IsObject } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['POSTGRESQL', 'MYSQL', 'REST_API', 'CSV'])
  type!: string;

  @IsObject()
  connectionInfo!: Record<string, unknown>;
}
