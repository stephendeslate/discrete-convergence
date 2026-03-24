import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateDataSourceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
