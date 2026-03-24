import { IsString, MaxLength, IsOptional, IsUUID, IsNumber, Min, IsIn, IsDateString } from 'class-validator';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  recipientName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsUUID()
  vehicleId?: string | null;

  @IsOptional()
  @IsUUID()
  driverId?: string | null;

  @IsOptional()
  @IsUUID()
  routeId?: string | null;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string | null;
}
