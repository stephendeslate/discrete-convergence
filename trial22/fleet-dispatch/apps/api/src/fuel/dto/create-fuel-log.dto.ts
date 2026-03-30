import { IsString, MaxLength, IsNumber, Min, IsInt, IsDateString } from 'class-validator';

export class CreateFuelLogDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsNumber()
  @Min(0)
  gallons!: number;

  @IsNumber()
  @Min(0)
  costPerUnit!: number;

  @IsNumber()
  @Min(0)
  totalCost!: number;

  @IsInt()
  @Min(0)
  mileage!: number;

  @IsDateString()
  filledAt!: string;
}
