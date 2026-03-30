import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDataSourceDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  connectionString?: string;
}
