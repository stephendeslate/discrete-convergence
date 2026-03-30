import { IsString, MaxLength, IsEnum } from 'class-validator';
import { DataSourceType } from '@prisma/client';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEnum(DataSourceType)
  type!: DataSourceType;
}
