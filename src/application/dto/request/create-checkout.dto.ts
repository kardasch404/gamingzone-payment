import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCheckoutRequestDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Customer email', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Idempotency key', required: false })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
