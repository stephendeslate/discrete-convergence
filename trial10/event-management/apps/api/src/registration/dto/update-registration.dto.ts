import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateRegistrationDto {
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status?: string;
}
