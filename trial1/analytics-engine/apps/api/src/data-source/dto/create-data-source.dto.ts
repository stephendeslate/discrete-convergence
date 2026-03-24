import { IsString, MaxLength, IsIn } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['REST_API', 'POSTGRESQL', 'CSV', 'WEBHOOK'])
  type!: string;
}
