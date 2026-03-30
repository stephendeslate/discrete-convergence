import { IsString, MaxLength, IsArray } from 'class-validator';

export class OptimizeRouteDto {
  @IsString()
  @MaxLength(36)
  technicianId!: string;

  @IsArray()
  @IsString({ each: true })
  workOrderIds!: string[];
}
