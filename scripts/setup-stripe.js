// Load environment variables first
require('dotenv').config({ path: '.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('Setting up Stripe products for Yoga for PE...\n');

    // Create Silver subscription product
    console.log('Creating Silver subscription product...');
    const silverProduct = await stripe.products.create({
      name: 'Yoga for PE - Silver Subscription',
      description: 'Access to Silver tier yoga videos and content',
      type: 'service',
    });

    const silverPrice = await stripe.prices.create({
      unit_amount: 799, // $7.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: silverProduct.id,
    });

    console.log(`✅ Silver Product ID: ${silverProduct.id}`);
    console.log(`✅ Silver Price ID: ${silverPrice.id}`);
    console.log(`   Price: $7.99/month\n`);

    // Create Gold subscription product
    console.log('Creating Gold subscription product...');
    const goldProduct = await stripe.products.create({
      name: 'Yoga for PE - Gold Subscription',
      description: 'Access to Gold tier yoga videos and premium content',
      type: 'service',
    });

    const goldPrice = await stripe.prices.create({
      unit_amount: 999, // $9.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: goldProduct.id,
    });

    console.log(`✅ Gold Product ID: ${goldProduct.id}`);
    console.log(`✅ Gold Price ID: ${goldPrice.id}`);
    console.log(`   Price: $9.99/month\n`);

    // Create webhook endpoint
    console.log('Creating webhook endpoint...');
    const webhook = await stripe.webhookEndpoints.create({
      url: 'https://your-domain.com/api/stripe/webhook',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
      ],
    });

    console.log(`✅ Webhook ID: ${webhook.id}`);
    console.log(`✅ Webhook Secret: ${webhook.secret}`);
    console.log(`   URL: ${webhook.url}\n`);

    // Output environment variables
    console.log('='.repeat(60));
    console.log('ADD THESE TO YOUR .env.local FILE:');
    console.log('='.repeat(60));
    console.log(`STRIPE_SILVER_PRICE_ID=${silverPrice.id}`);
    console.log(`STRIPE_GOLD_PRICE_ID=${goldPrice.id}`);
    console.log(`STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Error setting up Stripe products:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('Please check your STRIPE_SECRET_KEY in the .env file');
    }
  }
}

// Run the setup
setupStripeProducts();
