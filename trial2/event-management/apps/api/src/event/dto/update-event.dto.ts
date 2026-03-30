import { IsString, MaxLength, IsOptional, IsDateString, IsInt, Min } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}
