// TRACED: FD-DSP-001
import { IsString, MaxLength, IsOptional, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateDispatchDto {
  @IsString()
  @MaxLength(50)
  referenceNumber!: string;

  @IsString()
  @MaxLength(500)
  pickupAddress!: string;

  @IsString()
  @MaxLength(500)
  deliveryAddress!: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsNumber()
  @Min(0)
  weight!: number;

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
}
