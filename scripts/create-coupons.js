// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCoupons() {
  try {
    console.log('Creating Stripe coupons...');

    // 10% Off Coupon
    const coupon10 = await stripe.coupons.create({
      id: 'YOGA10',
      name: '10% Off Yoga Subscription',
      percent_off: 10,
      duration: 'once',
    });
    console.log('✅ Created 10% off coupon:', coupon10.id);

    // 50% Off Coupon
    const coupon50 = await stripe.coupons.create({
      id: 'YOGA50',
      name: '50% Off Yoga Subscription',
      percent_off: 50,
      duration: 'once',
    });
    console.log('✅ Created 50% off coupon:', coupon50.id);

    // 100% Off Coupon (Free)
    const coupon100 = await stripe.coupons.create({
      id: 'YOGAFREE',
      name: '100% Off Yoga Subscription (Free Trial)',
      percent_off: 100,
      duration: 'once',
    });
    console.log('✅ Created 100% off coupon:', coupon100.id);

    console.log('\n🎉 All coupons created successfully!');
    console.log('\nCoupon codes:');
    console.log('- YOGA10 (10% off)');
    console.log('- YOGA50 (50% off)');
    console.log('- YOGAFREE (100% off - Free trial)');

  } catch (error) {
    if (error.code === 'resource_already_exists') {
      console.log('⚠️  Some coupons already exist. Listing existing coupons...');
      
      try {
        const coupons = await stripe.coupons.list({ limit: 10 });
        console.log('\nExisting coupons:');
        coupons.data.forEach(coupon => {
          console.log(`- ${coupon.id}: ${coupon.name} (${coupon.percent_off}% off)`);
        });
      } catch (listError) {
        console.error('Error listing coupons:', listError.message);
      }
    } else {
      console.error('Error creating coupons:', error.message);
    }
  }
}

createCoupons();
