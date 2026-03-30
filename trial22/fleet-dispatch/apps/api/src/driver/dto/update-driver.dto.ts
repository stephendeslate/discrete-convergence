import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

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
  @IsString()
  @IsIn(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'])
  status?: string;
}
