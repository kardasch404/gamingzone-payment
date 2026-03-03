import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID || 'payment-service',
  groupId: process.env.KAFKA_GROUP_ID || 'payment-service-group',
  topics: {
    paymentEvents: 'gamingzone.payment.payment-events',
    refundEvents: 'gamingzone.payment.refund-events',
    dlq: 'gamingzone.payment.dlq',
  },
}));
