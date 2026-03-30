// TRACED: FD-VEH-001
import { IsString, MaxLength, IsInt, Min, Max, IsNumber } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MaxLength(20)
  licensePlate!: string;

  @IsString()
  @MaxLength(50)
  make!: string;

  @IsString()
  @MaxLength(50)
  model!: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @IsNumber()
  @Min(0)
  capacity!: number;
}
