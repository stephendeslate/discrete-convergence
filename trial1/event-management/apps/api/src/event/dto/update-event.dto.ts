import { IsString, MinLength, MaxLength, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  timezone?: string;

  @IsUUID()
  @IsOptional()
  venueId?: string;
}
