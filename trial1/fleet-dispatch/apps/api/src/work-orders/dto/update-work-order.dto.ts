import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { Priority } from '@prisma/client';

export class UpdateWorkOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  technicianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  customerId?: string;
}
