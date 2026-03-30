import { IsString, MaxLength, IsEmail, IsOptional, IsEnum } from 'class-validator';

// TRACED: FD-DRV-001
export class CreateDriverDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'SUSPENDED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
