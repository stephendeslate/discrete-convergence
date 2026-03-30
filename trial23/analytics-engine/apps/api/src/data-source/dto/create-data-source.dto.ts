import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsIn(['REST', 'POSTGRESQL', 'CSV', 'WEBHOOK'])
  type!: string;

  @IsOptional()
  @IsString()
  config?: string;
}
