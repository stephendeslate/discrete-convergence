import { IsString, MaxLength } from 'class-validator';

/** TRACED:EM-REG-001 — Registration DTO */
export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  ticketTypeId!: string;
}
