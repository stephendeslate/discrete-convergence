import { IsString, MaxLength, IsOptional, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @IsString()
  @MaxLength(50)
  date!: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(50)
  endDate?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;
}
