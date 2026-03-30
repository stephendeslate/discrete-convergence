import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(36)
  userId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
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
