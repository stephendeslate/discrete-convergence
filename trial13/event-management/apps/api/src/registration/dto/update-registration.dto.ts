import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
