import { IsString, MaxLength } from 'class-validator';

export class CreateRegistrationDto {
  @IsString()
  @MaxLength(36)
  ticketTypeId!: string;
}
