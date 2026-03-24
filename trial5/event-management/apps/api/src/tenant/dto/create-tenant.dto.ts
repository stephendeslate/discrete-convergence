import { IsString, IsOptional, IsIn, MaxLength, IsUrl } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsIn(['FREE', 'PRO', 'ENTERPRISE'])
  subscriptionTier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  brandColor?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
