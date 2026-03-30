import { IsString, MaxLength, IsNumber, Min, IsOptional, IsIn } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  type?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'SOLD', 'CANCELLED', 'REFUNDED'])
  status?: string;
}
