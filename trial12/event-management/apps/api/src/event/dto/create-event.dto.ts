import { IsString, MaxLength, IsDateString, IsInt, Min } from 'class-validator';

// TRACED: EM-EVENT-001
export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  @MaxLength(36)
  venueId!: string;
}
