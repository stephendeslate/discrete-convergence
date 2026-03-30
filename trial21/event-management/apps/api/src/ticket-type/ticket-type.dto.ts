import { IsString, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

/** TRACED:EM-TKT-001 — TicketType DTO, price in cents (Int) */
export class CreateTicketTypeDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsInt()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  quota!: number;
}

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;
}
