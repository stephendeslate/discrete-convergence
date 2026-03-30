import { IsString, IsDateString, IsInt, IsNumber, IsOptional, MaxLength, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @MaxLength(30)
  startDate!: string;

  @IsDateString()
  @MaxLength(30)
  endDate!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxAttendees!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ticketPrice!: number;

  @IsString()
  @MaxLength(36)
  venueId!: string;
}

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
  @MaxLength(30)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(30)
  endDate?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxAttendees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ticketPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}
