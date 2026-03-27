import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateDashboardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  layout?: string;
}
