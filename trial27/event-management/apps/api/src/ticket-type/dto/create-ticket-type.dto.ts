// TRACED: EM-SEC-002 — Create ticket type DTO with validation
import { IsString, IsNotEmpty, MaxLength, IsNumber, Min, IsInt } from 'class-validator';

export class CreateTicketTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}
