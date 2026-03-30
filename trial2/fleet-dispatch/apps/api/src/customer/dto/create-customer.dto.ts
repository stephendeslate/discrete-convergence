import { IsString, MaxLength, IsEmail, IsOptional } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @MaxLength(500)
  address!: string;
}
