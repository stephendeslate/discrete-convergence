import { IsString, IsOptional, IsUUID, IsDateString, IsArray } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  name: string;

  @IsUUID()
  technicianId: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  workOrderIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
