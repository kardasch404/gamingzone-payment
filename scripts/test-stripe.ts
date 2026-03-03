import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function testStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment');
    process.exit(1);
  }

  console.log('🔑 Using Stripe key:', secretKey.substring(0, 20) + '...');

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });

    const balance = await stripe.balance.retrieve();
    
    console.log('✅ Stripe connection successful!');
    console.log('📊 Account Balance:');
    console.log('  Available:', balance.available);
    console.log('  Pending:', balance.pending);
    console.log('  Livemode:', balance.livemode);
    
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    process.exit(1);
  }
}

testStripe();
