import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status?: string;
}
