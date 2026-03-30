import { IsString, MaxLength, IsOptional, IsDateString } from 'class-validator';

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
  @MaxLength(30)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}
