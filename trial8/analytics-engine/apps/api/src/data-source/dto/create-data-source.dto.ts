import { IsString, MaxLength, IsIn } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsIn(['POSTGRES', 'API', 'CSV'])
  type!: string;
}
