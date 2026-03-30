import { IsUUID } from 'class-validator';

export class AssignTechDto {
  @IsUUID()
  technicianId!: string;
}
