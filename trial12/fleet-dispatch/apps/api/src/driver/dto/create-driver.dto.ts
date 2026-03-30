// TRACED: FD-DRV-001
import { IsString, MaxLength, IsEmail, IsNumber, Min } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsNumber()
  @Min(0)
  costPerMile!: number;
}
