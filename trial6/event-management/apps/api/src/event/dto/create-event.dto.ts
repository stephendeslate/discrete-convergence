import { IsString, IsOptional, IsDateString, IsIn, MaxLength, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'])
  status?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsUUID()
  tenantId!: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  venueId?: string;
}
