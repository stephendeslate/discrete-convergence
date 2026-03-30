import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  eventId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  ticketTypeId?: string;
}
