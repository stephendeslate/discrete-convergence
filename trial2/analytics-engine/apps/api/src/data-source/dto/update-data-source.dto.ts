import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
