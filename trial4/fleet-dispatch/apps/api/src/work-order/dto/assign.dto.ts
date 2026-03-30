import { IsString, MaxLength } from 'class-validator';

export class AssignDto {
  @IsString()
  @MaxLength(36)
  technicianId!: string;
}
