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
    price: 14.99,
    description: 'Full access to all content including exclusive premium videos'
  }
};

// Define video categories
const VideoCategory = {
  MEDITATION: 'meditation',
  YOGA_FOR_PE: 'yogaForPE',
  RELAXATION: 'relaxation',
  OTHER: 'other'
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
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Vimeo API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Vimeo API:', error);
    return null;
  }
};

// Get all videos from the Vimeo account
const getAllVideos = async (page = 1) => {
  try {
    const data = await makeVimeoRequest('/users/me/videos', {
      page: page,
      per_page: 100,
      fields: 'uri,name,description,pictures,metadata,tags,duration,created_time'
    });

    if (!data || !data.data) {
      return [];
    }

    return data.data.map(processVideoData);
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};

// Process video data
const processVideoData = (video) => {
  const id = video.uri.split('/').pop();
  const category = determineVideoCategory(video);
  const requiredTier = determineRequiredTier(video);
  const thumbnail = video.pictures.sizes.find(size => size.width === 640)?.link || 
                    video.pictures.sizes[video.pictures.sizes.length - 1]?.link;

  return {
    id,
    title: video.name,
    description: video.description,
    thumbnail,
    category,
    duration: video.duration,
    created: video.created_time,
    requiredTier,
    vimeoId: id
  };
};

// Determine the video category based on metadata or tags
const determineVideoCategory = (video) => {
  // First check metadata fields
  if (video.metadata && video.metadata.connections && 
      video.metadata.connections.categories && 
      video.metadata.connections.categories.options) {
    
    const categoryNames = video.metadata.connections.categories.options
      .map(cat => cat.name.toLowerCase());
    
    if (categoryNames.includes('meditation')) return VideoCategory.MEDITATION;
    if (categoryNames.includes('yoga for pe') || categoryNames.includes('yoga')) return VideoCategory.YOGA_FOR_PE;
    if (categoryNames.includes('relaxation')) return VideoCategory.RELAXATION;
  }
  
  // Then check tags
  if (video.tags) {
    const tagNames = video.tags.map(tag => tag.name.toLowerCase());
    
    if (tagNames.includes('meditation')) return VideoCategory.MEDITATION;
    if (tagNames.includes('yoga for pe') || tagNames.includes('yoga')) return VideoCategory.YOGA_FOR_PE;
    if (tagNames.includes('relaxation')) return VideoCategory.RELAXATION;
  }
  
  // If nothing specific found, return OTHER
  return VideoCategory.OTHER;
};

// Determine required subscription tier from video metadata or tags
const determineRequiredTier = (video) => {
  // First check metadata for subscription info
  if (video.metadata && video.metadata.connections && 
      video.metadata.connections.custom_fields && 
      video.metadata.connections.custom_fields.options) {
    
    const fields = video.metadata.connections.custom_fields.options;
    const subscriptionField = fields.find(field => 
      field.name.toLowerCase() === 'subscription' || 
      field.name.toLowerCase() === 'tier'
    );
    
    if (subscriptionField) {
      const value = subscriptionField.value.toLowerCase();
      if (value.includes('gold')) return SubscriptionTier.GOLD;
      if (value.includes('silver')) return SubscriptionTier.SILVER;
      if (value.includes('bronze') || value.includes('free')) return SubscriptionTier.BRONZE;
    }
  }
  
  // Then check tags
  if (video.tags) {
    const tagNames = video.tags.map(tag => tag.name.toLowerCase());
    
    if (tagNames.includes('gold') || tagNames.includes('premium')) return SubscriptionTier.GOLD;
    if (tagNames.includes('silver')) return SubscriptionTier.SILVER;
    if (tagNames.includes('bronze') || tagNames.includes('free')) return SubscriptionTier.BRONZE;
  }
  
  // Default to bronze tier if no information found
  return SubscriptionTier.BRONZE;
};

// Check if user has access to video based on their subscription tier
const hasAccessToVideo = (video, userTier) => {
  // If user tier is undefined or null, default to BRONZE (free tier)
  const userSubscriptionLevel = userTier !== undefined ? userTier : SubscriptionTier.BRONZE;
  
  // Get video required tier
  const videoTier = typeof video === 'object' ? 
    video.requiredTier : 
    SubscriptionTier.BRONZE; // Default to free if not specified
  
  // User can access if their tier is equal or higher than video's required tier
  return userSubscriptionLevel >= videoTier;
};

// Get featured videos for homepage
const getFeaturedVideos = async (count = 4) => {
  try {
    // Try to get videos from the API
    const allVideos = await getAllVideos();
    
    if (!allVideos || allVideos.length === 0) {
      console.log('No videos found from API, using fallback data');
      return getFallbackFeaturedVideos();
    }
    
    // Group videos by category
    const videosByCategory = {
      [VideoCategory.MEDITATION]: [],
      [VideoCategory.YOGA_FOR_PE]: [],
      [VideoCategory.RELAXATION]: []
    };
    
    allVideos.forEach(video => {
      const category = video.category;
      if (videosByCategory[category]) {
        videosByCategory[category].push(video);
      }
    });
    
    // Get featured videos from each category
    const featured = [];
    
    // Try to get one from each category first
    Object.keys(videosByCategory).forEach(category => {
      if (videosByCategory[category].length > 0) {
        featured.push(videosByCategory[category][0]);
      }
    });
    
    // Fill remaining slots with random videos if needed
    while (featured.length < count && allVideos.length > featured.length) {
      const remainingVideos = allVideos.filter(v => !featured.find(f => f.id === v.id));
      if (remainingVideos.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * remainingVideos.length);
      featured.push(remainingVideos[randomIndex]);
    }
    
    return featured.slice(0, count);
  } catch (error) {
    console.error('Error getting featured videos:', error);
    return getFallbackFeaturedVideos();
  }
};

// Fallback featured videos when API fails
const getFallbackFeaturedVideos = () => {
  return [
    {
      id: '123456789',
      title: 'Meditation for Beginners',
      description: 'A gentle introduction to meditation practices suitable for all ages.',
      thumbnail: '/thumbnails/meditation-1.jpg',
      category: VideoCategory.MEDITATION,
      duration: 600, // 10 minutes
      requiredTier: SubscriptionTier.BRONZE,
      vimeoId: '123456789'
    },
    {
      id: '234567890',
      title: 'Yoga for PE: Morning Routine',
      description: 'Start your physical education class with this energizing morning yoga routine.',
      thumbnail: '/thumbnails/yoga-morning.jpg',
      category: VideoCategory.YOGA_FOR_PE,
      duration: 1200, // 20 minutes
      requiredTier: SubscriptionTier.BRONZE,
      vimeoId: '234567890'
    },
    {
      id: '345678901',
      title: 'Deep Relaxation Techniques',
      description: 'Advanced relaxation techniques for stress relief and improved focus.',
      thumbnail: '/thumbnails/relaxation-deep.jpg',
      category: VideoCategory.RELAXATION,
      duration: 900, // 15 minutes
      requiredTier: SubscriptionTier.SILVER,
      vimeoId: '345678901'
    },
    {
      id: '456789012',
      title: 'Premium Meditation Series: Part 1',
      description: 'First in our premium series of guided meditations for advanced practitioners.',
      thumbnail: '/thumbnails/premium-meditation.jpg',
      category: VideoCategory.MEDITATION,
      duration: 1800, // 30 minutes
      requiredTier: SubscriptionTier.GOLD,
      vimeoId: '456789012'
    }
  ];
};

// Get the URL for a video thumbnail or use a fallback
const getVideoThumbnailPath = (videoId) => {
  return `/thumbnails/${videoId}.jpg`;
};

// Determine if a video is accessible based on subscription
const isVideoAccessible = (video, userSubscription) => {
  // If video requires Gold tier but user has Silver or lower
  if (video.requiredTier === SubscriptionTier.GOLD && 
      (!userSubscription || userSubscription < SubscriptionTier.GOLD)) {
    return false;
  }
  
  // If video requires Silver tier but user has Bronze or lower
  if (video.requiredTier === SubscriptionTier.SILVER && 
      (!userSubscription || userSubscription < SubscriptionTier.SILVER)) {
    return false;
  }
  
  return true;
};

// Get video details by ID
const getVideoById = async (videoId) => {
  try {
    const data = await makeVimeoRequest(`/videos/${videoId}`, {
      fields: 'uri,name,description,pictures,metadata,tags,duration,created_time'
    });
    
    if (!data) return null;
    
    return processVideoData(data);
  } catch (error) {
    console.error(`Error fetching video with ID ${videoId}:`, error);
    return null;
  }
};

// Get videos by category
const getVideosByCategory = async (categoryId) => {
  try {
    const allVideos = await getAllVideos();
    
    if (!allVideos || allVideos.length === 0) {
      return [];
    }
    
    return allVideos.filter(video => {
      return video.category === categoryId;
    });
  } catch (error) {
    console.error(`Error fetching videos for category ${categoryId}:`, error);
    return [];
  }
};

// Export functions and constants
module.exports = {
  SubscriptionTier,
  VideoCategory,
  getVimeoToken,
  makeVimeoRequest,
  getAllVideos,
  getFeaturedVideos,
  getVideoById,
  getVideosByCategory,
  hasAccessToVideo,
  isVideoAccessible,
  getVideoThumbnailPath
};
