// Browser-compatible Vimeo utility
// This version uses standard Vimeo API with fetch

// Define subscription tiers
const SubscriptionTier = {
  BRONZE: 0,
  SILVER: 1,
  GOLD: 2,
  // Add descriptions for UI display
  0: {
    name: 'Bronze',
    price: 0,
    description: 'Free access to basic content'
  },
  1: {
    name: 'Silver',
    price: 9.99,
    description: 'Access to Silver tier content including premium videos'
  },
  2: {
    name: 'Gold',
    price: 19.99,
    description: 'Full access to all premium content including live sessions'
  }
};

// Define video categories
const VideoCategory = {
  INTRO: 0,
  WARM_UP: 1,
  MAIN_PRACTICE: 2,
  COOL_DOWN: 3,
  SPECIAL: 4,
  // Add descriptions for UI display
  0: { name: 'Introduction', description: 'Introductory videos' },
  1: { name: 'Warm Up', description: 'Warm up exercises' },
  2: { name: 'Main Practice', description: 'Core yoga practices' },
  3: { name: 'Cool Down', description: 'Cool down and relaxation' },
  4: { name: 'Special', description: 'Special content and features' }
};

// Helper function to get Vimeo API token
function getVimeoToken() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN || null;
  } else {
    return process.env.VIMEO_ACCESS_TOKEN || null;
  }
}

// Make a request to the Vimeo API proxy
const makeVimeoRequest = async (endpoint, params = {}) => {
  const apiUrl = new URL('/api/vimeo', window.location.origin);
  apiUrl.searchParams.append('endpoint', endpoint);
  Object.entries(params).forEach(([key, value]) => {
    apiUrl.searchParams.append(key, value);
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vimeo API request failed: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Get all videos from the Vimeo account
const getAllVideos = async (page = 1) => {
  try {
    return await makeVimeoRequest('/me/videos', { 
      page,
      per_page: 100,
      sort: 'date',
      direction: 'desc',
      fields: 'uri,name,description,pictures,duration,tags,metadata'
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return { data: [] };
  }
};

// Process video data
const processVideoData = (video) => {
  if (!video) return null;

  const thumbnailUrl = video.pictures?.sizes?.[3]?.link || '';
  
  // Extract category from video metadata or tags
  const category = determineVideoCategory(video);
  
  // Extract required subscription tier from metadata or tags
  const requiredTier = determineRequiredTier(video);

  return {
    id: video.uri.split('/').pop(),
    title: video.name,
    description: video.description || '',
    thumbnail: thumbnailUrl,
    duration: video.duration,
    category,
    requiredTier
  };
};

// Determine the video category based on metadata or tags
const determineVideoCategory = (video) => {
  // Check if video has category in metadata
  if (video.metadata?.custom_fields?.category) {
    const categoryStr = video.metadata.custom_fields.category.toLowerCase();
    if (categoryStr.includes('intro')) return VideoCategory.INTRO;
    if (categoryStr.includes('warm')) return VideoCategory.WARM_UP;
    if (categoryStr.includes('main')) return VideoCategory.MAIN_PRACTICE;
    if (categoryStr.includes('cool')) return VideoCategory.COOL_DOWN;
    if (categoryStr.includes('special')) return VideoCategory.SPECIAL;
  }
  
  // Check tags as fallback
  if (video.tags) {
    for (const tag of video.tags) {
      const tagName = tag.name.toLowerCase();
      if (tagName.includes('intro')) return VideoCategory.INTRO;
      if (tagName.includes('warm')) return VideoCategory.WARM_UP;
      if (tagName.includes('main')) return VideoCategory.MAIN_PRACTICE;
      if (tagName.includes('cool')) return VideoCategory.COOL_DOWN;
      if (tagName.includes('special')) return VideoCategory.SPECIAL;
    }
  }
  
  // Default to main practice if no category found
  return VideoCategory.MAIN_PRACTICE;
};

// Determine required subscription tier from video metadata or tags
const determineRequiredTier = (video) => {
  // Check if video has tier information in metadata
  if (video.metadata?.custom_fields?.tier) {
    const tierStr = video.metadata.custom_fields.tier.toLowerCase();
    if (tierStr.includes('gold')) return SubscriptionTier.GOLD;
    if (tierStr.includes('silver')) return SubscriptionTier.SILVER;
    if (tierStr.includes('bronze')) return SubscriptionTier.BRONZE;
  }
  
  // Check tags as fallback
  if (video.tags) {
    for (const tag of video.tags) {
      const tagName = tag.name.toLowerCase();
      if (tagName.includes('gold')) return SubscriptionTier.GOLD;
      if (tagName.includes('silver')) return SubscriptionTier.SILVER;
      if (tagName.includes('bronze') || tagName.includes('free')) return SubscriptionTier.BRONZE;
    }
  }
  
  // Default to gold tier if no tier information found
  return SubscriptionTier.GOLD;
};

// Check if user has access to video based on their subscription tier
const hasAccessToVideo = (video, userTier) => {
  // If no video or invalid user tier, deny access
  if (!video || userTier === undefined || userTier === null) return false;
  
  // Convert tiers to numeric values for comparison
  const videoTier = typeof video.requiredTier === 'number' ? video.requiredTier : SubscriptionTier.GOLD;
  const userTierValue = typeof userTier === 'number' ? userTier : SubscriptionTier.BRONZE;
  
  // User has access if their tier is equal or higher than video's required tier
  return userTierValue >= videoTier;
};

// Get featured videos for homepage
const getFeaturedVideos = async (count = 4) => {
  try {
    const response = await getAllVideos();
    if (!response || !response.data || response.data.length === 0) {
      console.warn('No videos found, using fallback data');
      return getFallbackFeaturedVideos();
    }
    
    // Filter videos with 'featured' tag or metadata
    let featuredVideos = response.data.filter(video => {
      // Check metadata for featured flag
      if (video.metadata?.custom_fields?.featured === 'true') return true;
      
      // Check tags for 'featured' tag
      return video.tags && video.tags.some(tag => 
        tag.name.toLowerCase().includes('featured')
      );
    });
    
    // If no featured videos found, just take the latest videos
    if (featuredVideos.length === 0) {
      console.log('No videos with featured tag found, using latest videos');
      featuredVideos = response.data.slice(0, count);
    }
    
    // Process and limit the number of featured videos
    return featuredVideos
      .slice(0, count)
      .map(processVideoData)
      .filter(Boolean); // Remove any null values
  } catch (error) {
    console.error('Error getting featured videos:', error);
    return getFallbackFeaturedVideos();
  }
};

// Fallback featured videos when API fails
const getFallbackFeaturedVideos = () => {
  return [
    {
      id: '12345',
      title: 'Introduction to Yoga for PE',
      description: 'Learn the basics of incorporating yoga into physical education curriculum.',
      thumbnail: '/images/fallback-featured-1.jpg',
      duration: 300, // 5 minutes
      category: VideoCategory.INTRO,
      requiredTier: SubscriptionTier.BRONZE
    },
    {
      id: '23456',
      title: 'Warm-Up Routine for Classes',
      description: 'A complete warm-up routine designed specifically for classroom settings.',
      thumbnail: '/images/fallback-featured-2.jpg',
      duration: 600, // 10 minutes
      category: VideoCategory.WARM_UP,
      requiredTier: SubscriptionTier.BRONZE
    },
    {
      id: '34567',
      title: 'Balance Poses for Strength',
      description: 'Intermediate balance poses to build strength and focus in students.',
      thumbnail: '/images/fallback-featured-3.jpg',
      duration: 900, // 15 minutes
      category: VideoCategory.MAIN_PRACTICE,
      requiredTier: SubscriptionTier.SILVER
    },
    {
      id: '45678',
      title: 'Mindfulness and Cool Down',
      description: 'End-of-session mindfulness practices and cool down stretches.',
      thumbnail: '/images/fallback-featured-4.jpg',
      duration: 480, // 8 minutes
      category: VideoCategory.COOL_DOWN,
      requiredTier: SubscriptionTier.BRONZE
    }
  ];
};

// Get the URL for a video thumbnail or use a fallback
const getVideoThumbnailPath = (videoId) => {
  if (!videoId) return '/images/fallback-thumbnail.jpg';
  return `/api/video-thumbnail/${videoId}`;
};

// Determine if a video is accessible based on subscription
const isVideoAccessible = (video, userSubscription) => {
  if (!video) return false;
  
  // Convert subscription level to numeric value
  const userTier = userSubscription?.tier || SubscriptionTier.BRONZE;
  
  return hasAccessToVideo(video, userTier);
};

// Get video details by ID
const getVideoById = async (videoId) => {
  if (!videoId) return null;
  
  try {
    const video = await makeVimeoRequest(`/videos/${videoId}`);
    return processVideoData(video);
  } catch (error) {
    console.error(`Error fetching video ${videoId}:`, error);
    return null;
  }
};

// Get videos by category
const getVideosByCategory = async (categoryId) => {
  try {
    const response = await getAllVideos();
    if (!response || !response.data) return [];
    
    return response.data
      .filter(video => determineVideoCategory(video) === categoryId)
      .map(processVideoData)
      .filter(Boolean);
  } catch (error) {
    console.error(`Error fetching videos for category ${categoryId}:`, error);
    return [];
  }
};

// Export functions and constants
module.exports = {
  SubscriptionTier,
  VideoCategory,
  getAllVideos,
  getFeaturedVideos,
  getVideoById,
  getVideosByCategory,
  processVideoData,
  hasAccessToVideo,
  isVideoAccessible,
  getVideoThumbnailPath
};
