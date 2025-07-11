// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function fixYogaFreeCoupon() {
  try {
    console.log('Fixing YOGAFREE coupon...');
    
    // Get Silver and Gold product IDs from price IDs
    const silverPriceId = process.env.STRIPE_SILVER_PRICE_ID;
    const goldPriceId = process.env.STRIPE_GOLD_PRICE_ID;
    
    console.log(`Silver Price ID: ${silverPriceId}`);
    console.log(`Gold Price ID: ${goldPriceId}`);
    
    // Get the prices to find their product IDs
    const silverPrice = await stripe.prices.retrieve(silverPriceId);
    const goldPrice = await stripe.prices.retrieve(goldPriceId);
    
    const silverProductId = silverPrice.product;
    const goldProductId = goldPrice.product;
    
    console.log(`Silver Product ID: ${silverProductId}`);
    console.log(`Gold Product ID: ${goldProductId}`);
    
    // Delete the existing YOGAFREE coupon
    try {
      await stripe.coupons.del('YOGAFREE');
      console.log('Deleted existing YOGAFREE coupon');
    } catch (error) {
      console.log('No existing YOGAFREE coupon to delete or error:', error.message);
    }
    
    // Create a new YOGAFREE coupon that explicitly applies to both products
    const coupon = await stripe.coupons.create({
      id: 'YOGAFREE',
      name: '100% Off Yoga Subscription (Free Trial)',
      percent_off: 100,
      duration: 'once',
      applies_to: {
        products: [silverProductId, goldProductId],
      },
    });
    
    console.log('✅ Successfully recreated YOGAFREE coupon with explicit product associations!');
    console.log(`Coupon ID: ${coupon.id}`);
    console.log(`Percent Off: ${coupon.percent_off}%`);
    console.log(`Duration: ${coupon.duration}`);
    console.log(`Valid: ${coupon.valid}`);
    
    if (coupon.applies_to && coupon.applies_to.products) {
      console.log(`Applies to products: ${coupon.applies_to.products.join(', ')}`);
    }
    
  } catch (error) {
    console.error('Error fixing YOGAFREE coupon:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('Stripe Error Details:', error);
    }
  }
}

fixYogaFreeCoupon();
