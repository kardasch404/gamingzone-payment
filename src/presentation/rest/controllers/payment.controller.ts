import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCheckoutRequestDto } from '../../../application/dto/request/create-checkout.dto';
import { CreateRefundRequestDto } from '../../../application/dto/request/create-refund.dto';
import { CreateCheckoutSessionUseCase } from '../../../application/use-cases/commands/create-checkout-session.use-case';
import { CreateRefundUseCase } from '../../../application/use-cases/commands/create-refund.use-case';
import { GetPaymentQueryHandler } from '../../../application/use-cases/queries/get-payment.query';
import { CreateCheckoutSessionCommand } from '../../../application/use-cases/commands/create-checkout-session.command';
import { CreateRefundCommand } from '../../../application/use-cases/commands/create-refund.command';

@ApiTags('payments')
@Controller('api/payments')
export class PaymentController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly createRefundUseCase: CreateRefundUseCase,
    private readonly getPaymentQueryHandler: GetPaymentQueryHandler,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createCheckout(@Body() dto: CreateCheckoutRequestDto) {
    const command = new CreateCheckoutSessionCommand(
      dto.orderId,
      dto.userId,
      dto.email,
      dto.idempotencyKey,
    );

    return await this.createCheckoutSessionUseCase.execute(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    return await this.getPaymentQueryHandler.execute({ paymentId: id });
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get payment by order ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  async getPaymentByOrder(@Param('orderId') orderId: string) {
    // Implementation would query by orderId
    return { orderId, message: 'Not implemented' };
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request refund' })
  @ApiResponse({ status: 201, description: 'Refund created' })
  async createRefund(
    @Param('id') id: string,
    @Body() dto: CreateRefundRequestDto,
  ) {
    const command = new CreateRefundCommand(
      id,
      dto.amount,
      dto.reason,
    );

    return await this.createRefundUseCase.execute(command);
  }

  @Get(':id/refunds')
  @ApiOperation({ summary: 'List refunds for payment' })
  @ApiResponse({ status: 200, description: 'Refunds list' })
  async listRefunds(@Param('id') id: string) {
    // Implementation would query refunds
    return { paymentId: id, refunds: [] };
  }
}
