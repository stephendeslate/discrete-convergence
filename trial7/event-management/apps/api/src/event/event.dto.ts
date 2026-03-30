import {
  IsString,
  MaxLength,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  IsIn,
  IsNumber,
} from 'class-validator';

// TRACED:EM-EVT-001
export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsDateString()
  @MaxLength(50)
  startDate!: string;

  @IsDateString()
  @MaxLength(50)
  endDate!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  @MaxLength(36)
  venueId!: string;

  @IsString()
  @MaxLength(36)
  categoryId!: string;
}

// TRACED:EM-EVT-002
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
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  venueId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  categoryId?: string;
}
