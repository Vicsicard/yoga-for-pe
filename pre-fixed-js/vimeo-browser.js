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
  GENERAL: 'general'
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
async function makeVimeoRequest(endpoint, params = {}) {
  try {
    const token = getVimeoToken();
    if (!token) {
      throw new Error('Vimeo API token not found');
    }

    const url = new URL(`https://api.vimeo.com${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Vimeo API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Vimeo API request failed:', error);
    return null;
  }
}

// Get all videos from the Vimeo account
async function getAllVideos(page = 1) {
  try {
    const data = await makeVimeoRequest('/me/videos', {
      page: page,
      per_page: 50,
      sort: 'date',
      direction: 'desc'
    });
    
    if (!data || !data.data) {
      return [];
    }
    
    return data.data.map(video => processVideoData(video));
  } catch (error) {
    console.error('Failed to get videos:', error);
    return [];
  }
}

// Process video data
function processVideoData(video) {
  if (!video) return null;
  
  return {
    id: video.uri.split('/').pop(),
    title: video.name,
    description: video.description || '',
    thumbnail: video.pictures?.sizes?.[3]?.link || '',
    duration: video.duration,
    url: video.player_embed_url,
    date: new Date(video.created_time).toLocaleDateString(),
    category: determineVideoCategory(video),
    tier: determineRequiredTier(video)
  };
}

// Determine the video category based on metadata or tags
function determineVideoCategory(video) {
  if (!video) return VideoCategory.GENERAL;
  
  // Try to get category from description or tags
  const description = (video.description || '').toLowerCase();
  const tags = video.tags?.map(tag => tag.name.toLowerCase()) || [];
  
  if (description.includes('meditation') || tags.some(tag => tag.includes('meditation'))) {
    return VideoCategory.MEDITATION;
  }
  
  if (description.includes('yoga for pe') || 
      tags.some(tag => tag.includes('yoga') && tag.includes('pe'))) {
    return VideoCategory.YOGA_FOR_PE;
  }
  
  if (description.includes('relaxation') || tags.some(tag => tag.includes('relaxation'))) {
    return VideoCategory.RELAXATION;
  }
  
  // Default category
  return VideoCategory.GENERAL;
}

// Determine required subscription tier from video metadata or tags
function determineRequiredTier(video) {
  if (!video) return SubscriptionTier.BRONZE;
  
  // Try to determine tier from description or tags
  const description = (video.description || '').toLowerCase();
  const tags = video.tags?.map(tag => tag.name.toLowerCase()) || [];
  
  // Check for premium/paid content identifiers
  if (
    description.includes('gold') || 
    description.includes('premium exclusive') ||
    tags.some(tag => tag.includes('gold') || tag.includes('premium exclusive'))
  ) {
    return SubscriptionTier.GOLD;
  }
  
  if (
    description.includes('silver') || 
    description.includes('premium') ||
    tags.some(tag => tag.includes('silver') || tag.includes('premium'))
  ) {
    return SubscriptionTier.SILVER;
  }
  
  // Default to Bronze/free tier
  return SubscriptionTier.BRONZE;
}

// Check if user has access to video based on their subscription tier
function hasAccessToVideo(video, userTier = SubscriptionTier.BRONZE) {
  if (!video) return false;
  
  // Get video's required tier
  const videoTier = typeof video === 'object' ? 
    video.tier : 
    determineRequiredTier(video);
  
  // User has access if their tier is >= video's required tier
  return userTier >= videoTier;
}

// Get featured videos for homepage
async function getFeaturedVideos(count = 4) {
  try {
    const videos = await getAllVideos(1);
    
    if (!videos || videos.length === 0) {
      return getFallbackFeaturedVideos();
    }
    
    // Sort videos by giving priority to higher tier content
    const sortedVideos = [...videos].sort((a, b) => {
      // First prioritize by tier (higher tier first)
      if (b.tier !== a.tier) {
        return b.tier - a.tier;
      }
      
      // Then by newest
      return new Date(b.date) - new Date(a.date);
    });
    
    // Get videos from different categories
    const result = {
      meditation: [],
      yogaForPE: [],
      relaxation: []
    };
    
    sortedVideos.forEach(video => {
      if (video.category === VideoCategory.MEDITATION && result.meditation.length < count) {
        result.meditation.push(video);
      } else if (video.category === VideoCategory.YOGA_FOR_PE && result.yogaForPE.length < count) {
        result.yogaForPE.push(video);
      } else if (video.category === VideoCategory.RELAXATION && result.relaxation.length < count) {
        result.relaxation.push(video);
      }
    });
    
    // If we don't have enough videos, add some fallbacks
    if (result.meditation.length < count) {
      result.meditation = [...result.meditation, ...getFallbackFeaturedVideos().meditation].slice(0, count);
    }
    
    if (result.yogaForPE.length < count) {
      result.yogaForPE = [...result.yogaForPE, ...getFallbackFeaturedVideos().yogaForPE].slice(0, count);
    }
    
    if (result.relaxation.length < count) {
      result.relaxation = [...result.relaxation, ...getFallbackFeaturedVideos().relaxation].slice(0, count);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to get featured videos:', error);
    return getFallbackFeaturedVideos();
  }
}

// Fallback featured videos when API fails
function getFallbackFeaturedVideos() {
  return {
    meditation: [
      {
        id: '611668648',
        title: 'Morning Meditation',
        description: 'Start your day with a calming meditation session',
        thumbnail: '/images/meditation-1.jpg',
        duration: 600, // 10 minutes
        url: 'https://player.vimeo.com/video/611668648',
        date: '2023-09-15',
        category: VideoCategory.MEDITATION,
        tier: SubscriptionTier.BRONZE
      },
      {
        id: '611668649',
        title: 'Mindfulness Practice',
        description: 'Premium meditation for stress relief',
        thumbnail: '/images/meditation-2.jpg',
        duration: 900, // 15 minutes
        url: 'https://player.vimeo.com/video/611668649',
        date: '2023-09-20',
        category: VideoCategory.MEDITATION,
        tier: SubscriptionTier.SILVER
      }
    ],
    yogaForPE: [
      {
        id: '611668650',
        title: 'Yoga for PE: Warm-up Exercises',
        description: 'Essential warm-up exercises for PE classes',
        thumbnail: '/images/yoga-pe-1.jpg',
        duration: 480, // 8 minutes
        url: 'https://player.vimeo.com/video/611668650',
        date: '2023-10-01',
        category: VideoCategory.YOGA_FOR_PE,
        tier: SubscriptionTier.BRONZE
      },
      {
        id: '611668651',
        title: 'Yoga for PE: Advanced Flows',
        description: 'Premium yoga flows for PE curriculum',
        thumbnail: '/images/yoga-pe-2.jpg',
        duration: 1200, // 20 minutes
        url: 'https://player.vimeo.com/video/611668651',
        date: '2023-10-10',
        category: VideoCategory.YOGA_FOR_PE,
        tier: SubscriptionTier.GOLD
      }
    ],
    relaxation: [
      {
        id: '611668652',
        title: 'After-School Relaxation',
        description: 'Wind down after a busy school day',
        thumbnail: '/images/relaxation-1.jpg',
        duration: 300, // 5 minutes
        url: 'https://player.vimeo.com/video/611668652',
        date: '2023-10-15',
        category: VideoCategory.RELAXATION,
        tier: SubscriptionTier.BRONZE
      },
      {
        id: '611668653',
        title: 'Deep Relaxation Journey',
        description: 'Premium guided relaxation experience',
        thumbnail: '/images/relaxation-2.jpg',
        duration: 1500, // 25 minutes
        url: 'https://player.vimeo.com/video/611668653',
        date: '2023-10-20',
        category: VideoCategory.RELAXATION,
        tier: SubscriptionTier.SILVER
      }
    ]
  };
}

// Get the URL for a video thumbnail or use a fallback
function getVideoThumbnailPath(videoId) {
  return `/images/video-${videoId}.jpg`;
}

// Determine if a video is accessible based on subscription
function isVideoAccessible(video, userSubscription = SubscriptionTier.BRONZE) {
  // If video is a string (just the ID), we don't have enough info
  if (typeof video === 'string') {
    return true; // Default to accessible for UI/UX
  }
  
  // If it's an object with tier property
  if (video && typeof video === 'object' && 'tier' in video) {
    // User can access if their subscription tier is >= video's required tier
    return userSubscription >= video.tier;
  }
  
  // Default to accessible if we can't determine
  return true;
}

// Get video details by ID
async function getVideoById(videoId) {
  try {
    if (!videoId) return null;
    
    const data = await makeVimeoRequest(`/videos/${videoId}`);
    
    if (!data) {
      return null;
    }
    
    return processVideoData(data);
  } catch (error) {
    console.error(`Failed to get video ${videoId}:`, error);
    return null;
  }
}

// Get videos by category
async function getVideosByCategory(categoryId) {
  try {
    const allVideos = await getAllVideos();
    
    if (!allVideos || allVideos.length === 0) {
      return [];
    }
    
    return allVideos.filter(video => 
      video.category === categoryId
    ).sort((a, b) => {
      // Sort by tier (higher tier first)
      if (b.tier !== a.tier) {
        return b.tier - a.tier;
      }
      
      // Then by newest
      return new Date(b.date) - new Date(a.date);
    });
  } catch (error) {
    console.error(`Failed to get videos for category ${categoryId}:`, error);
    return [];
  }
}

// Export functions and constants
module.exports = {
  SubscriptionTier,
  VideoCategory,
  getAllVideos,
  getFeaturedVideos,
  getVideosByCategory,
  getVideoById,
  isVideoAccessible,
  hasAccessToVideo,
  determineVideoCategory,
  determineRequiredTier,
  getVideoThumbnailPath
};
