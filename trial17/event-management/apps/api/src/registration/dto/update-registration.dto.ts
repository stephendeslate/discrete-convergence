import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
