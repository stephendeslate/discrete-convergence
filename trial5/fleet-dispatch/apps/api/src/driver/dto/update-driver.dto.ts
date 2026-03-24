import { IsString, MaxLength, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsUUID()
  vehicleId?: string | null;
}
