import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

// TRACED:FD-DRV-002
export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'])
  @IsString()
  @MaxLength(20)
  status?: string;
}
