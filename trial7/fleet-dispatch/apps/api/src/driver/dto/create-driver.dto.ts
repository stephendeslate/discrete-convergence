import { IsString, MaxLength } from 'class-validator';

// TRACED:FD-DRV-001
export class CreateDriverDto {
  @IsString()
  @MaxLength(36)
  tenantId!: string;

  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(50)
  licenseNumber!: string;

  @IsString()
  @MaxLength(20)
  phone!: string;
}
