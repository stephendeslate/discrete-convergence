import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsIn(['FREE', 'PRO', 'ENTERPRISE'])
  tier?: string;

  @IsOptional()
  settings?: Record<string, unknown>;
}
