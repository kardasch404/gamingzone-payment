import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateRefundRequestDto {
  @ApiProperty({ description: 'Refund amount', required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ description: 'Refund reason', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
