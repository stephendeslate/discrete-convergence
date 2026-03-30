import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';
import { PRIORITY_LEVELS } from '@fleet-dispatch/shared';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn([...PRIORITY_LEVELS])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsOptional()
  @IsString()
  @MaxLength(50)
  scheduledAt?: string;
}
