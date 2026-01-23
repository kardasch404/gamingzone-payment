import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StripeService } from './infrastructure/external/stripe/stripe.service';

async function testStripeConnection() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const stripeService = app.get(StripeService);
  
  try {
    const stripe = stripeService.getClient();
    
    // Test API connection by retrieving account info
    const account = await stripe.balance.retrieve();
    
    console.log('✅ Stripe connection successful!');
    console.log('Account balance:', account);
    console.log('Available:', account.available);
    console.log('Pending:', account.pending);
    
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
  } finally {
    await app.close();
  }
}

testStripeConnection();
