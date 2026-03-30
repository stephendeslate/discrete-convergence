// TRACED:FD-DSP-001 — Create dispatch DTO
import { IsString, IsDateString, MaxLength } from 'class-validator';

export class CreateDispatchDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;

  @IsString()
  @MaxLength(36)
  routeId!: string;

  @IsDateString()
  scheduledAt!: string;
}
