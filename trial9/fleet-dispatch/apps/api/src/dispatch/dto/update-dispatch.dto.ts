import { IsString, MaxLength, IsOptional, IsIn, IsDateString, IsNumber } from 'class-validator';

export class UpdateDispatchDto {
  @IsOptional()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  @MaxLength(50)
  completedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsNumber()
  totalCost?: number;
}
