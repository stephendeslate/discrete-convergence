// TRACED:EM-EVT-001
import { IsString, IsOptional, IsInt, Min, MaxLength, IsEnum, IsUUID } from 'class-validator';

export class CreateSponsorDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsEnum(['GOLD', 'SILVER', 'BRONZE'])
  @MaxLength(20)
  tier?: 'GOLD' | 'SILVER' | 'BRONZE';

  @IsInt()
  @Min(0)
  amount!: number;

  @IsUUID()
  @MaxLength(36)
  eventId!: string;
}

export class UpdateSponsorDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEnum(['GOLD', 'SILVER', 'BRONZE'])
  @MaxLength(20)
  tier?: 'GOLD' | 'SILVER' | 'BRONZE';

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;
}
