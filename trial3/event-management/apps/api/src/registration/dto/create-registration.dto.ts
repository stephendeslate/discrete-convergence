import { IsUUID, MaxLength } from 'class-validator';

export class CreateRegistrationDto {
  @IsUUID()
  @MaxLength(36)
  ticketTypeId!: string;
}
