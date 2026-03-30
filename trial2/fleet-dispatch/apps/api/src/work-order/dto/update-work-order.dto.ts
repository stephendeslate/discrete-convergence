import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';
import { Priority } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: Priority;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  scheduledAt?: string;
}
