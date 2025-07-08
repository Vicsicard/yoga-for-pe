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
    description: 'Access to all content including exclusive Gold videos'
  }
};

// Define video categories
const VideoCategory = {
  MEDITATION: 'meditation',
  YOGA_FOR_PE: 'yoga-for-pe',
  RELAXATION: 'relaxation',
  MINDFUL_MOVEMENTS: 'mindful-movements'
};

// Helper function to get the Vimeo access token
function getVimeoToken() {
  // Check for browser environment
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN || null;
  } else {
    // Server-side
    return process.env.VIMEO_ACCESS_TOKEN || null;
  }
}

// Helper function to make requests to our Vimeo API proxy
const makeVimeoRequest = async (endpoint, params = {}) => {
  // Use our API route as a proxy to avoid CORS issues
  const apiUrl = new URL('/api/vimeo', window.location.origin);
  
  // Add the endpoint and other params to the query string
  apiUrl.searchParams.append('endpoint', endpoint);
  Object.entries(params).forEach(([key, value]) => {
    apiUrl.searchParams.append(key, value);
  });

  try {
    console.log(`Making request to: ${apiUrl.toString()}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vimeo API error (${response.status}):`, errorText);
      throw new Error(`Vimeo API request failed: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Vimeo API request error:', error);
    throw error;
  }
};

// Map of category names to their Vimeo folder IDs or tags
// These will need to be updated with your actual folder IDs or tags once created
const categoryMappings = {
  [VideoCategory.MEDITATION]: 'meditation',
  [VideoCategory.YOGA_FOR_PE]: 'yoga-for-pe',
  [VideoCategory.RELAXATION]: 'relaxation',
  [VideoCategory.MINDFUL_MOVEMENTS]: 'mindful-movements'
};

// Function to get videos by category with pagination
async function getVideosByCategory(category, page = 1, perPage = 3) {
  try {
    // We'll assume we're using tags for categorization
    // You could modify this to use folders or other criteria
    const params = {
      per_page: perPage,
      page: page,
      sort: 'date',
      direction: 'desc',
      tags: categoryMappings[category] || category
    };

    // Use the proxy endpoint
    const data = await makeVimeoRequest('/videos', params);
    
    // Process the videos to add tier information, format duration, etc.
    const processedVideos = data.data.map(video => {
      return {
        id: video.uri.split('/').pop(),
        title: video.name,
        description: video.description || '',
        duration: formatDuration(video.duration),
        level: getMetadataField(video, 'level') || 'All Levels',
        thumbnail: video.pictures?.link || '',
        vimeoId: video.uri.split('/').pop(),
        tier: getVideoTier(video),
        category: category
      };
    });

    return {
      videos: processedVideos,
      pagination: {
        total: data.total,
        perPage: perPage,
        currentPage: page,
        totalPages: Math.ceil(data.total / perPage)
      }
    };
  } catch (error) {
    console.error('Error fetching videos by category:', error);
    return { videos: [], pagination: { total: 0, perPage, currentPage: page, totalPages: 0 } };
  }
}

// Helper function to get metadata field from video
function getMetadataField(video, field) {
  if (!video || !video.metadata || !video.metadata.connections) {
    return null;
  }

  // Try to find the field in various places
  // First check custom fields if they exist
  if (video.metadata.connections.customFields) {
    const customField = video.metadata.connections.customFields.find(
      f => f.name.toLowerCase() === field.toLowerCase()
    );
    if (customField) return customField.value;
  }

  return null;
}

// Helper function to format duration in MM:SS format
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to determine subscription tier based on video tags or metadata
function getVideoTier(video) {
  // First check metadata for explicit tier information
  const tierFromMetadata = getMetadataField(video, 'tier');
  if (tierFromMetadata) {
    const tierName = tierFromMetadata.toUpperCase();
    if (tierName === 'GOLD') return SubscriptionTier.GOLD;
    if (tierName === 'SILVER') return SubscriptionTier.SILVER;
  }

  // Check tags
  const tags = video.tags || [];
  if (tags.some(tag => tag.name.toLowerCase().includes('gold'))) {
    return SubscriptionTier.GOLD;
  } else if (tags.some(tag => tag.name.toLowerCase().includes('silver'))) {
    return SubscriptionTier.SILVER;
  }

  // Default to BRONZE (free tier)
  return SubscriptionTier.BRONZE;
}

// Function to check if a user has access to a video based on their subscription tier
async function hasAccessToVideo(video, userId, userTier) {
  try {
    // If no userId is provided, use the passed userTier or default to BRONZE
    if (!userId) {
      return (userTier || SubscriptionTier.BRONZE) >= video.tier;
    }

    // If we have a userId, check their subscription status from the service
    // This is a server-side only import to avoid issues with browser bundling
    if (typeof window === 'undefined') {
      const { getSubscriptionServiceInstance } = await import('./subscription/subscription-service-factory');
      const subscriptionService = getSubscriptionServiceInstance();

      // Check if the user has access to this video's tier
      return await subscriptionService.hasAccessToTier(userId, video.tier);
    } else {
      // For client-side, we'll need to make an API call
      try {
        const response = await fetch(`/api/subscription/check-access?videoTier=${video.tier}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check subscription access');
        }

        const data = await response.json();
        return data.hasAccess;
      } catch (apiError) {
        console.error('Error checking subscription access via API:', apiError);
        // Fall back to the provided tier or BRONZE if API call fails
        return (userTier || SubscriptionTier.BRONZE) >= video.tier;
      }
    }
  } catch (error) {
    console.error('Error checking video access:', error);
    // Default to no access on error
    return false;
  }
}

// Function to get featured free videos for the homepage - one from each category 
async function getFeaturedFreeVideos() {
  // Define the specific videos we want to feature
  const featuredVideoIds = [
    '457053392', // Meditation - I Am Meditation
    '1095788590', // Yoga for PE - Ab Circle 1
    '452426275'  // Relaxation - Body Scan with Flowers
  ];

  console.log('Fetching featured videos by IDs:', featuredVideoIds);

  // Custom descriptions for each video
  const customDescriptions = {
    '457053392': 'A guided meditation to help you connect with your inner self and find peace.',
    '1095788590': 'A fun, full-circle core workout that targets every major ab muscle in one dynamic loop.',
    '452426275': 'A relaxing body scan meditation to help you unwind and connect with your body.'
  };

  // Map each ID to its category
  const idToCategoryMap = {
    '457053392': VideoCategory.MEDITATION,
    '1095788590': VideoCategory.YOGA_FOR_PE,
    '452426275': VideoCategory.RELAXATION
  };

  // Thumbnail paths for each video
  const thumbnailMap = {
    '457053392': '/thumbnails/meditation/I Am.jpg',
    '1095788590': '/thumbnails/yoga-for-pe/Ab Circle 1.jpg',
    '452426275': '/thumbnails/relaxation/Body Scan with Flowers.jpg'
  };

  // Fallback videos in case the API calls fail
  const fallbackVideos = [
    {
      id: '457053392',
      title: 'I Am',
      description: 'A guided meditation to help you connect with your inner self and find peace.',
      duration: '1:08',
      level: 'Beginner',
      thumbnail: '/thumbnails/meditation/I Am.jpg',
      vimeoId: '457053392',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.MEDITATION
    },
    {
      id: '1095788590',
      title: 'Ab Circle 1',
      description: 'A fun, full-circle core workout that targets every major ab muscle in one dynamic loop.',
      duration: '1:30',
      level: 'Beginner',
      thumbnail: '/thumbnails/yoga-for-pe/Ab Circle 1.jpg',
      vimeoId: '1095788590',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: '452426275',
      title: 'Body Scan with Flowers',
      description: 'A relaxing body scan meditation to help you unwind and connect with your body.',
      duration: '1:00',
      level: 'Beginner',
      thumbnail: '/thumbnails/relaxation/Body Scan with Flowers.jpg',
      vimeoId: '452426275',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.RELAXATION
    }
  ];

  // Check if token is available for API access
  const token = getVimeoToken();
  if (!token) {
    console.error('Vimeo API token not found');
    return fallbackVideos; // Use our fallbacks with reliable thumbnails
  }

  try {
    const featuredVideos = [];

    // Try to fetch each video from Vimeo API
    for (const videoId of featuredVideoIds) {
      try {
        const response = await fetch(
          `https://api.vimeo.com/videos/${videoId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.vimeo.*+json;version=3.4'
            }
          }
        );

        if (!response.ok) {
          console.error(`Error fetching featured video ${videoId}:`, response.statusText);
          continue;
        }

        const data = await response.json();
        
        featuredVideos.push({
          id: parseInt(videoId),
          title: data.name,
          description: customDescriptions[videoId] || data.description || '',
          duration: formatDuration(data.duration),
          level: 'All Levels',
          // Use our pre-defined thumbnail path for reliability
          thumbnail: thumbnailMap[videoId] || data.pictures?.base_link || '',
          vimeoId: videoId,
          tier: SubscriptionTier.BRONZE,
          category: idToCategoryMap[videoId] || VideoCategory.YOGA_FOR_PE
        });
      } catch (error) {
        console.error(`Error processing featured video ${videoId}:`, error);
      }
    }

    // If we couldn't fetch all videos, fill with fallbacks
    if (featuredVideos.length < 3) {
      console.log(`Only fetched ${featuredVideos.length} videos, adding fallbacks`);

      // Find which videos we're missing 
      const fetchedIds = featuredVideos.map(v => v.vimeoId);
      const missingFallbacks = fallbackVideos.filter(v => !fetchedIds.includes(v.vimeoId));

      // Add them to our result
      return [...featuredVideos, ...missingFallbacks];
    }

    console.log('Successfully fetched all featured videos');
    return featuredVideos;
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    // Return fallbacks on any error
    return fallbackVideos;
  }
}

// Simple function to map video categories to thumbnail folders
function getThumbnailFolder(category) {
  switch(category) {
    case VideoCategory.MEDITATION: return 'meditation';
    case VideoCategory.YOGA_FOR_PE: return 'yoga-for-pe';
    case VideoCategory.RELAXATION: return 'relaxation';
    case VideoCategory.MINDFUL_MOVEMENTS: return 'mindful-movements';
    default: return 'yoga-for-pe';
  }
}

// Helper to ensure thumbnail path is correct
function ensureThumbnailPath(video) {
  // If no video or already has a full thumbnail path, return as is
  if (!video || (video.thumbnail && video.thumbnail.startsWith('/'))) {
    return video;
  }

  // Clone the video object to avoid mutating the original
  const updatedVideo = { ...video };
  
  // Determine the appropriate thumbnail folder based on category
  const folder = getThumbnailFolder(video.category);
  
  // Create a clean filename from the title
  const filename = video.title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, ' ');
  
  // Update the thumbnail path
  updatedVideo.thumbnail = `/thumbnails/${folder}/${filename}.jpg`;
  
  return updatedVideo;
}

// Helper function to determine video category from metadata or tags
function determineVideoCategory(video) {
  // Check metadata first
  const categoryFromMetadata = getMetadataField(video, 'category');
  if (categoryFromMetadata) {
    if (categoryFromMetadata.toLowerCase() === 'meditation') return VideoCategory.MEDITATION;
    if (categoryFromMetadata.toLowerCase() === 'yoga-for-pe') return VideoCategory.YOGA_FOR_PE;
    if (categoryFromMetadata.toLowerCase() === 'relaxation') return VideoCategory.RELAXATION;
  }

  // Check tags
  const tags = video.tags || [];
  if (tags.some((tag) => tag.name.toLowerCase() === 'meditation')) {
    return VideoCategory.MEDITATION;
  } else if (tags.some((tag) => tag.name.toLowerCase() === 'yoga-for-pe')) {
    return VideoCategory.YOGA_FOR_PE;
  } else if (tags.some((tag) => tag.name.toLowerCase() === 'relaxation')) {
    return VideoCategory.RELAXATION;
  }

  // Default to YOGA_FOR_PE if we can't determine
  return VideoCategory.YOGA_FOR_PE;
}

module.exports = {
  SubscriptionTier,
  VideoCategory,
  makeVimeoRequest,
  getVideosByCategory,
  hasAccessToVideo,
  getFeaturedFreeVideos,
  ensureThumbnailPath,
  determineVideoCategory
};
