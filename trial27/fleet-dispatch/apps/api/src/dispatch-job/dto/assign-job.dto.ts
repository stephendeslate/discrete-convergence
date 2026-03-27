// TRACED: FD-API-004 — Assign job DTO with validation
import { IsString, MaxLength } from 'class-validator';

export class AssignJobDto {
  @IsString()
  @MaxLength(36)
  vehicleId!: string;

  @IsString()
  @MaxLength(36)
  driverId!: string;
}
