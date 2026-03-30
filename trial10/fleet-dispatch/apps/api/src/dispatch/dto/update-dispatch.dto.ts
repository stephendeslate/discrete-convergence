import { IsString, MaxLength, IsInt, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { DispatchStatus } from '@prisma/client';

export class UpdateDispatchDto {
  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  completedAt?: string;
}
