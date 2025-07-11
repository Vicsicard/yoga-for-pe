// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function checkCoupons() {
  try {
    console.log('Checking Stripe coupons...');
    
    // List all coupons
    const coupons = await stripe.coupons.list({ limit: 10 });
    
    console.log('\nExisting coupons:');
    coupons.data.forEach(coupon => {
      console.log(`- ${coupon.id}: ${coupon.name || 'No name'} (${coupon.percent_off}% off)`);
      console.log(`  Valid: ${!coupon.deleted}, Duration: ${coupon.duration}`);
      if (coupon.id === 'YOGAFREE' || coupon.id === 'YOGA50' || coupon.id === 'YOGA10') {
        console.log(`  Details for ${coupon.id}:`, JSON.stringify(coupon, null, 2));
      }
    });

    // Check if our coupons exist
    const yogaFreeCoupon = coupons.data.find(c => c.id === 'YOGAFREE');
    const yoga50Coupon = coupons.data.find(c => c.id === 'YOGA50');
    const yoga10Coupon = coupons.data.find(c => c.id === 'YOGA10');

    // If any are missing or invalid, recreate them
    if (!yogaFreeCoupon || yogaFreeCoupon.deleted) {
      console.log('\nRecreating YOGAFREE coupon...');
      await recreateCoupon('YOGAFREE', '100% Off Yoga Subscription (Free Trial)', 100);
    }
    
    if (!yoga50Coupon || yoga50Coupon.deleted) {
      console.log('\nRecreating YOGA50 coupon...');
      await recreateCoupon('YOGA50', '50% Off Yoga Subscription', 50);
    }
    
    if (!yoga10Coupon || yoga10Coupon.deleted) {
      console.log('\nRecreating YOGA10 coupon...');
      await recreateCoupon('YOGA10', '10% Off Yoga Subscription', 10);
    }
    
    console.log('\n✅ Coupon check complete!');
  } catch (error) {
    console.error('Error checking coupons:', error.message);
  }
}

async function recreateCoupon(id, name, percentOff) {
  try {
    // Try to delete the coupon if it exists but is invalid
    try {
      await stripe.coupons.del(id);
      console.log(`- Deleted existing invalid coupon: ${id}`);
    } catch (err) {
      // Ignore errors if the coupon doesn't exist
    }
    
    // Create a new coupon
    const coupon = await stripe.coupons.create({
      id,
      name,
      percent_off: percentOff,
      duration: 'once',
      applies_to: {
        products: [], // Empty array means it applies to all products
      },
    });
    
    console.log(`- Created coupon: ${coupon.id} (${coupon.percent_off}% off)`);
    return coupon;
  } catch (error) {
    console.error(`Error recreating coupon ${id}:`, error.message);
  }
}

checkCoupons();
