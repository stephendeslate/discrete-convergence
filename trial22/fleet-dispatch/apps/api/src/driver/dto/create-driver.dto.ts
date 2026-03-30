import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

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
  @IsString()
  @IsIn(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'])
  status?: string;
}
