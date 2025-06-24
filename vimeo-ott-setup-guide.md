# Vimeo OTT Setup Guide for Yoga for PE

This guide will walk you through setting up the Vimeo OTT system for your Yoga for PE website, including configuring subscription tiers, uploading videos, and applying proper metadata.

## 1. Vimeo OTT Account Setup

### Create a Vimeo OTT Account
1. Go to [Vimeo OTT](https://vimeo.com/ott) and sign up for an account
2. Choose the appropriate plan that allows for subscription tiers
3. Set up your account details and branding

### Configure Subscription Tiers
Set up the following subscription tiers in your Vimeo OTT dashboard:

1. **Bronze (Free)**
   - Price: $0.00/month
   - Description: Free access to select videos
   - Access Level: Basic

2. **Silver**
   - Price: $7.99/month
   - Description: Access to Bronze and Silver content
   - Access Level: Standard

3. **Gold**
   - Price: $9.99/month
   - Description: Access to all content including exclusive Gold videos
   - Access Level: Premium

## 2. Generate API Keys

1. In your Vimeo OTT dashboard, navigate to Settings > API
2. Generate a new API key with appropriate permissions
3. Copy the API key and update your `.env.local` file:
   ```
   NEXT_PUBLIC_VIMEO_OTT_API_KEY=your_actual_api_key
   ```

## 3. Upload Videos and Apply Metadata

### Video Categories
Your website is configured to use the following categories:
- Meditation
- Yoga for PE
- Relaxation

### Uploading Videos
1. Log in to your Vimeo OTT dashboard
2. Navigate to the Content section
3. Click "Upload" to add a new video
4. Fill in the following metadata for each video:

#### Required Metadata
- **Title**: Clear, descriptive title
- **Description**: Detailed description of the video content
- **Duration**: Will be automatically detected
- **Category**: Choose from Meditation, Yoga for PE, or Relaxation
- **Level**: Beginner, Intermediate, or Advanced
- **Subscription Tier**:
  - Bronze (Free)
  - Silver ($7.99/month)
  - Gold ($9.99/month)

#### Example Video Metadata

**Example 1: Free Video**
- Title: Introduction to Breathing Techniques
- Description: Learn fundamental breathing techniques for yoga practice
- Category: Meditation
- Level: Beginner
- Tier: Bronze (Free)

**Example 2: Silver Tier Video**
- Title: Sun Salutation Series for PE Classes
- Description: A complete guide to teaching sun salutations in PE
- Category: Yoga for PE
- Level: Intermediate
- Tier: Silver

**Example 3: Gold Tier Video**
- Title: Advanced Partner Yoga for Athletic Performance
- Description: Partner yoga techniques to enhance athletic performance
- Category: Yoga for PE
- Level: Advanced
- Tier: Gold

### Adding Custom Fields
In your Vimeo OTT dashboard, add custom fields to your videos:
1. Go to Settings > Custom Fields
2. Add the following custom fields:
   - `level`: Text field (Beginner, Intermediate, Advanced)
   - `category`: Text field (meditation, yoga-for-pe, relaxation)
   - `tier`: Number field (0 for Bronze, 1 for Silver, 2 for Gold)

## 4. Testing Your Integration

1. After uploading videos and configuring your API key, restart your development server:
   ```
   npm run dev
   ```

2. Visit the Videos page to ensure:
   - Videos are properly categorized
   - Free videos are accessible to all users
   - Silver videos show the subscription prompt for Bronze users
   - Gold videos show the subscription prompt for Bronze and Silver users

3. Test the subscription flow:
   - Click on a premium video
   - Verify the subscription modal appears with correct pricing
   - Test the "Subscribe Now" button redirects to the appropriate Vimeo OTT page

## 5. Troubleshooting

### API Key Issues
If videos aren't loading, check:
- Your API key is correctly set in `.env.local`
- The API key has the proper permissions
- The API key is being properly passed to the Vimeo OTT API

### Video Access Issues
If videos aren't properly restricted by tier:
- Verify custom fields are correctly set for each video
- Check that the `getSubscriptionTier` function in `vimeo-browser.ts` is correctly mapping price to tier
- Ensure the `hasAccessToVideo` function is properly checking user subscription level

### Subscription Flow Issues
If the subscription process isn't working:
- Verify your Vimeo OTT subscription pages are properly configured
- Check that the subscription URLs in the modal are correct
- Ensure your Vimeo OTT account is set up to accept subscriptions

## 6. Going Live

Before going live with your subscription system:
1. Test the entire flow in a production-like environment
2. Verify all videos are properly categorized and tiered
3. Test the subscription process with real payment methods
4. Set up analytics to track subscription conversions

For additional support, refer to the [Vimeo OTT documentation](https://vimeo.com/ott/help) or contact Vimeo OTT support.
