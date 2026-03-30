// TRACED:EM-EVT-001 TRACED:EM-EVT-007
import { IsString, IsOptional, IsDateString, IsInt, Min, MaxLength, IsEnum, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @MaxLength(200)
  slug!: string;

  @IsDateString()
  @MaxLength(50)
  startDate!: string;

  @IsDateString()
  @MaxLength(50)
  endDate!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  venueId?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  venueId?: string;
}
