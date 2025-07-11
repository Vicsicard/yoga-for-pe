// Test script to verify subscription access control
const { SubscriptionTier, hasAccessToVideo } = require('./lib/vimeo-browser');

// Mock video data for testing
const testVideos = [
  {
    id: 'bronze-video',
    title: 'Free Meditation',
    tier: SubscriptionTier.BRONZE,
    description: 'A free meditation video'
  },
  {
    id: 'silver-video', 
    title: 'Premium Yoga Flow',
    tier: SubscriptionTier.SILVER,
    description: 'A premium yoga video for Silver subscribers'
  },
  {
    id: 'gold-video',
    title: 'Advanced Mindfulness',
    tier: SubscriptionTier.GOLD,
    description: 'An advanced video for Gold subscribers'
  }
];

async function testAccessControl() {
  console.log('🧪 Testing Subscription Access Control System\n');
  
  // Test 1: Unauthenticated user (no userId, no tier)
  console.log('📋 Test 1: Unauthenticated User Access');
  for (const video of testVideos) {
    const hasAccess = await hasAccessToVideo(video);
    const expected = video.tier === SubscriptionTier.BRONZE;
    console.log(`  ${video.title} (${getTierName(video.tier)}): ${hasAccess ? '✅ Access' : '❌ No Access'} ${hasAccess === expected ? '✓' : '✗ UNEXPECTED'}`);
  }
  
  // Test 2: Authenticated user with Bronze tier (free)
  console.log('\n📋 Test 2: Authenticated User - Bronze Tier');
  for (const video of testVideos) {
    const hasAccess = await hasAccessToVideo(video, 'user123', SubscriptionTier.BRONZE);
    const expected = video.tier === SubscriptionTier.BRONZE;
    console.log(`  ${video.title} (${getTierName(video.tier)}): ${hasAccess ? '✅ Access' : '❌ No Access'} ${hasAccess === expected ? '✓' : '✗ UNEXPECTED'}`);
  }
  
  // Test 3: Authenticated user with Silver tier
  console.log('\n📋 Test 3: Authenticated User - Silver Tier');
  for (const video of testVideos) {
    const hasAccess = await hasAccessToVideo(video, 'user456', SubscriptionTier.SILVER);
    const expected = video.tier <= SubscriptionTier.SILVER;
    console.log(`  ${video.title} (${getTierName(video.tier)}): ${hasAccess ? '✅ Access' : '❌ No Access'} ${hasAccess === expected ? '✓' : '✗ UNEXPECTED'}`);
  }
  
  // Test 4: Authenticated user with Gold tier
  console.log('\n📋 Test 4: Authenticated User - Gold Tier');
  for (const video of testVideos) {
    const hasAccess = await hasAccessToVideo(video, 'user789', SubscriptionTier.GOLD);
    const expected = true; // Gold tier should have access to all videos
    console.log(`  ${video.title} (${getTierName(video.tier)}): ${hasAccess ? '✅ Access' : '❌ No Access'} ${hasAccess === expected ? '✓' : '✗ UNEXPECTED'}`);
  }
  
  console.log('\n🎯 Summary:');
  console.log('- Bronze (Free) videos: Accessible to everyone');
  console.log('- Silver videos: Require Silver or Gold subscription');
  console.log('- Gold videos: Require Gold subscription');
  console.log('\n✨ If all tests show ✓, the access control system is working correctly!');
}

function getTierName(tier) {
  switch (tier) {
    case SubscriptionTier.BRONZE: return 'Bronze/Free';
    case SubscriptionTier.SILVER: return 'Silver';
    case SubscriptionTier.GOLD: return 'Gold';
    default: return 'Unknown';
  }
}

// Run the tests
testAccessControl().catch(console.error);
