import { IsString, MaxLength, IsOptional, IsIn, IsDateString } from 'class-validator';

// TRACED:FD-DSP-002
export class UpdateDispatchDto {
  @IsOptional()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
