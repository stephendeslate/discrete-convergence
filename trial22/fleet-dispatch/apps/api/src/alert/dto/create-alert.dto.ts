import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: string;
}
