import { IsEmail, IsString, MaxLength, IsIn } from 'class-validator';
import { DRIVER_STATUSES } from '@fleet-dispatch/shared';

export class CreateDriverDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsIn([...DRIVER_STATUSES])
  @IsString()
  @MaxLength(20)
  status!: string;
}
