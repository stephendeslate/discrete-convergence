import { IsString, MaxLength, IsOptional, IsIn, IsEmail, IsNumber } from 'class-validator';

// TRACED: FD-DRV-001
export class CreateDriverDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsOptional()
  @IsIn(['AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'SUSPENDED'])
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsNumber()
  hourlyRate!: number;
}
