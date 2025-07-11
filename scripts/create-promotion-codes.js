// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPromotionCodes() {
  try {
    console.log('Creating Stripe promotion codes for existing coupons...');
    
    // Create promotion codes for each coupon
    await createPromotionCode('YOGAFREE', 'YOGAFREE');
    await createPromotionCode('YOGA50', 'YOGA50');
    await createPromotionCode('YOGA10', 'YOGA10');
    
    console.log('\n✅ Promotion codes created successfully!');
    console.log('\nHow to use:');
    console.log('1. Customers should enter these exact codes at checkout');
    console.log('2. Make sure allow_promotion_codes: true is set in your checkout session');
    console.log('3. Test each code to ensure they apply the correct discount');
    
  } catch (error) {
    console.error('Error creating promotion codes:', error.message);
    if (error.type === 'StripeInvalidRequestError') {
      console.error('Stripe Error Details:', error);
    }
  }
}

async function createPromotionCode(couponId, code) {
  try {
    // Check if promotion code already exists
    const existingCodes = await stripe.promotionCodes.list({
      code,
      limit: 1
    });
    
    if (existingCodes.data.length > 0) {
      console.log(`Promotion code ${code} already exists. Skipping creation.`);
      return existingCodes.data[0];
    }
    
    // Create a new promotion code
    const promotionCode = await stripe.promotionCodes.create({
      coupon: couponId,
      code,
      active: true,
      // Don't set max_redemptions for unlimited redemptions
    });
    
    console.log(`Created promotion code: ${promotionCode.code} for coupon ${couponId}`);
    console.log(`- Active: ${promotionCode.active}`);
    console.log(`- Expires: ${promotionCode.expires_at ? new Date(promotionCode.expires_at * 1000).toISOString() : 'Never'}`);
    
    return promotionCode;
  } catch (error) {
    console.error(`Error creating promotion code for ${couponId}:`, error.message);
    throw error;
  }
}

createPromotionCodes();
