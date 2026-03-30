import { IsString, MaxLength, IsOptional, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsDateString()
  @IsString()
  @MaxLength(36)
  expiresAt?: string;
}
