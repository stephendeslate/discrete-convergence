import { IsString, IsUUID, IsArray, IsDateString } from 'class-validator';

export class OptimizeRouteDto {
  @IsDateString()
  date!: string;

  @IsUUID()
  technicianId!: string;

  @IsArray()
  @IsString({ each: true })
  workOrderIds!: string[];
}
