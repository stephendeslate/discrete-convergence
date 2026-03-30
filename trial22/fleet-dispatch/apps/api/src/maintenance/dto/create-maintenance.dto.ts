import { IsString, MaxLength, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsDateString()
  performedAt!: string;
}
