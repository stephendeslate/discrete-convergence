import { IsString, MaxLength, IsOptional, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @MaxLength(50)
  trackingCode!: string;

  @IsString()
  @MaxLength(255)
  recipientName!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  routeId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
