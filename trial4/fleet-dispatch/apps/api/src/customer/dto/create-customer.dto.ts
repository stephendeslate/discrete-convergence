import { IsString, MaxLength, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
