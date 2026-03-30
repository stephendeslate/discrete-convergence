import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;
}
