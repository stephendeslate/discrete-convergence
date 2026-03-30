import { IsString, MaxLength, IsOptional, IsEmail, IsNumber, IsIn } from 'class-validator';

export class UpdateSponsorDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'])
  tier?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEmail()
  @IsString()
  @MaxLength(255)
  contactEmail?: string;
}
