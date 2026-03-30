// TRACED: FD-DSP-002
import { IsString, MaxLength, IsOptional, IsNumber, Min, IsDateString, IsIn } from 'class-validator';

export class UpdateDispatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pickupAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryAddress?: string;

  @IsOptional()
  @IsIn(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  vehicleId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  driverId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsDateString()
  deliveredAt?: string;
}
