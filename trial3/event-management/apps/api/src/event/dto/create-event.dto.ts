import {
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';

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

  @IsString()
  @MaxLength(100)
  timezone!: string;

  @IsDateString()
  @MaxLength(30)
  startDate!: string;

  @IsDateString()
  @MaxLength(30)
  endDate!: string;

  @IsInt()
  @Min(0)
  capacity!: number;

  @IsOptional()
  @IsUUID()
  @MaxLength(36)
  venueId?: string;
}
