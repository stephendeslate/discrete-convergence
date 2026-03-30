import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
