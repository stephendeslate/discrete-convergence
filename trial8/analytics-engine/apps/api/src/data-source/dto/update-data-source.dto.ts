import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';
import { DataSourceStatus } from '@prisma/client';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'ERROR'])
  status?: DataSourceStatus;
}
