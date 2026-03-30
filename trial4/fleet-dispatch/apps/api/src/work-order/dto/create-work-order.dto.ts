// TRACED:FD-API-005 — DTO validation with class-validator decorators
import { IsString, MaxLength, IsOptional, IsIn, IsNumber } from 'class-validator';
import { PRIORITY_LEVELS } from '@fleet-dispatch/shared';

export class CreateWorkOrderDto {
  @IsString()
  @MaxLength(255)
  title!: string;

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

  @IsString()
  @MaxLength(36)
  customerId!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
