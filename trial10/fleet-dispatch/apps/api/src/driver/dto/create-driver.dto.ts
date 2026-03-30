import { IsString, MaxLength } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;
}
