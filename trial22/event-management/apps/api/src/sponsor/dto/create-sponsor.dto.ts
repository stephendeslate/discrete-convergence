import { IsString, MaxLength, IsOptional, IsEmail, IsNumber, IsIn } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'])
  tier?: string;

  @IsNumber()
  amount!: number;

  @IsEmail()
  @IsString()
  @MaxLength(255)
  contactEmail!: string;
}
