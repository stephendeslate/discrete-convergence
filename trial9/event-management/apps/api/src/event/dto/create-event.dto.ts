import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';

// TRACED: EM-EVENT-001
export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  @IsIn(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
  status?: string;

  @IsString()
  @MaxLength(36)
  venueId!: string;
}
