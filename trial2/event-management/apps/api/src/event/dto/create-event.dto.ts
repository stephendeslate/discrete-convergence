import { IsString, MaxLength, IsOptional, IsDateString, IsInt, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsString()
  @MaxLength(255)
  slug!: string;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  startDate!: string;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  endDate!: string;

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
