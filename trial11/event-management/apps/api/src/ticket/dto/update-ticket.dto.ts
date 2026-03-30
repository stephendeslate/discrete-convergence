import { IsString, MaxLength, IsNumber, IsInt, Min, IsOptional, IsIn } from 'class-validator';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['AVAILABLE', 'RESERVED', 'SOLD', 'CANCELLED'])
  status?: string;
}
