import {
  IsString,
  IsArray,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @MaxLength(36)
  technicianId!: string;

  @IsDateString()
  date!: string;

  @IsArray()
  @IsString({ each: true })
  workOrderIds!: string[];
}
