import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateTripDto {
  @IsOptional()
  @IsString()
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}
