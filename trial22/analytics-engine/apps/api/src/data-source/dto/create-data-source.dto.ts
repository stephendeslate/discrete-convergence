import { IsString, MaxLength } from 'class-validator';

export class CreateDataSourceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsString()
  @MaxLength(2000)
  connectionString!: string;
}
