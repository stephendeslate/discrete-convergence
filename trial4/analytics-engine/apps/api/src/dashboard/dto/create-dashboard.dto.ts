import { IsString, MaxLength } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @MaxLength(255)
  title!: string;
}
