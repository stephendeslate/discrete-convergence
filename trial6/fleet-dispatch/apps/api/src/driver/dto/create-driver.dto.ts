import { IsString, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;
}
