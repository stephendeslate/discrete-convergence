import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
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
  @IsIn(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}
