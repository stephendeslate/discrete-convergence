import { IsString, MaxLength, IsOptional, IsNumber, IsInt, Min, Max, IsIn } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Max(999999999999)
  price?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100000)
  quantity?: number;

  @IsString()
  @IsOptional()
  @IsIn(['AVAILABLE', 'SOLD', 'CANCELLED'])
  status?: string;
}
