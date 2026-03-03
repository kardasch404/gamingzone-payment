import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface GetPaymentRequest {
  paymentId: string;
}

interface GetPaymentByOrderRequest {
  orderId: string;
}

interface ValidatePaymentRequest {
  orderId: string;
}

interface PaymentResponse {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  paidAt?: string;
}

interface ValidationResponse {
  valid: boolean;
  status: string;
  reason?: string;
}

@Controller()
export class PaymentGrpcController {
  @GrpcMethod('PaymentService', 'GetPayment')
  async getPayment(data: GetPaymentRequest): Promise<PaymentResponse> {
    // Implementation would query payment by ID
    return {
      id: data.paymentId,
      orderId: 'order-123',
      status: 'SUCCEEDED',
      amount: 1000,
      currency: 'MAD',
      paidAt: new Date().toISOString(),
    };
  }

  @GrpcMethod('PaymentService', 'GetPaymentByOrder')
  async getPaymentByOrder(
    data: GetPaymentByOrderRequest,
  ): Promise<PaymentResponse> {
    // Implementation would query payment by order ID
    return {
      id: 'payment-123',
      orderId: data.orderId,
      status: 'SUCCEEDED',
      amount: 1000,
      currency: 'MAD',
      paidAt: new Date().toISOString(),
    };
  }

  @GrpcMethod('PaymentService', 'ValidatePayment')
  async validatePayment(
    data: ValidatePaymentRequest,
  ): Promise<ValidationResponse> {
    // Implementation would validate payment status
    return {
      valid: true,
      status: 'SUCCEEDED',
      reason: '',
    };
  }
}
