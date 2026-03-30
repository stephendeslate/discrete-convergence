import { IsString, MaxLength, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  speakerId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
