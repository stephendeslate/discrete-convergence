import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'CANCELLED'])
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(36)
  venueId?: string;
}
