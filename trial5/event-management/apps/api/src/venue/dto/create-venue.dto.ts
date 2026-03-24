import { IsString, IsInt, Min, MaxLength, IsUUID } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(500)
  address!: string;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsString()
  @IsUUID()
  tenantId!: string;
}
