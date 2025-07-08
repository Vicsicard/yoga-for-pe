// Video catalog data loader
import { getThumbnailPath } from './thumbnail-mapping';
import videoCatalogData from '../data/video-catalog.json';

// Define constants to replace enums
const VideoCategory = {
  MEDITATION: 'MEDITATION',
  YOGA_FOR_PE: 'YOGA_FOR_PE',
  RELAXATION: 'RELAXATION',
  MINDFUL_MOVEMENTS: 'MINDFUL_MOVEMENTS'
};

const SubscriptionTier = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD'
};

// Map tier strings to subscription tiers
const tierMap = {
  'Bronze': SubscriptionTier.BRONZE,
  'Silver': SubscriptionTier.SILVER,
  'Gold': SubscriptionTier.GOLD,
  'free': SubscriptionTier.BRONZE // Free is equivalent to Bronze tier
};

// Convert catalog data to Video objects
export function loadVideosFromCatalog(category) {
  let categoryKey = 'meditation'; // Default value
  
  // Map VideoCategory enum to JSON category keys
  if (category === VideoCategory.MEDITATION) {
    categoryKey = 'meditation';
  } else if (category === VideoCategory.YOGA_FOR_PE) {
    categoryKey = 'yoga-for-pe';
  } else if (category === VideoCategory.RELAXATION) {
    categoryKey = 'relaxation';
  } else if (category === VideoCategory.MINDFUL_MOVEMENTS) {
    categoryKey = 'mindful-movements';
  }
  
  // Get videos for the specified category
  const videos = videoCatalogData[categoryKey] || [];
  
  // Convert to Video objects
  return videos.map(function(v) {
    // Determine the tier
    let videoTier = SubscriptionTier.BRONZE; // Default to BRONZE
    if (v.tier && tierMap[v.tier]) {
      videoTier = tierMap[v.tier];
    } else if (v.tier) {
      videoTier = SubscriptionTier.GOLD;
    }
    
    // Create video object with all properties
    const videoObj = {
      id: v.id,
      title: v.title,
      description: v.description,
      duration: v.duration || 0,
      thumbnailUrl: getThumbnailPath(v.title, categoryKey),
      category: category || VideoCategory.MEDITATION,
      tier: videoTier || SubscriptionTier.BRONZE,
      tags: v.tags || [],
      featured: v.featured || false
    };
    
    return videoObj;
  });
}

// Get featured videos across all categories
export function getFeaturedVideos(limit) {
  // Set default value for limit
  if (limit === undefined) {
    limit = 3;
  }
  const allVideos = [
    ...loadVideosFromCatalog(VideoCategory.MEDITATION),
    ...loadVideosFromCatalog(VideoCategory.YOGA_FOR_PE),
    ...loadVideosFromCatalog(VideoCategory.RELAXATION)
  ];
  
  const featuredVideos = allVideos.filter(function(video) { 
    return video.featured; 
  });
  
  return featuredVideos.slice(0, limit);
}

// Get videos by tier
export function getVideosByTier(tier) {
  const allVideos = [
    ...loadVideosFromCatalog(VideoCategory.MEDITATION),
    ...loadVideosFromCatalog(VideoCategory.YOGA_FOR_PE),
    ...loadVideosFromCatalog(VideoCategory.RELAXATION)
  ];
  
  return allVideos.filter(function(video) {
    return video.tier === tier || video.tier === SubscriptionTier.BRONZE;
  });
}

// Search videos
export function searchVideos(query, category, tier) {
  // Set defaults
  if (category === undefined) {
    category = null;
  }
  
  if (tier === undefined) {
    tier = null;
  }
  
  // Get all videos or videos from a specific category
  let videos;
  if (category) {
    videos = loadVideosFromCatalog(category);
  } else {
    videos = [
      ...loadVideosFromCatalog(VideoCategory.MEDITATION),
      ...loadVideosFromCatalog(VideoCategory.YOGA_FOR_PE),
      ...loadVideosFromCatalog(VideoCategory.RELAXATION)
    ];
  }
  
  // Filter by search query
  const filtered = videos.filter(function(video) {
    // Check if video matches query
    let matchesQuery = true;
    if (query) {
      const lowerQuery = query.toLowerCase();
      matchesQuery = video.title.toLowerCase().includes(lowerQuery) || 
                    video.description.toLowerCase().includes(lowerQuery);
      
      // Check tags
      if (!matchesQuery && video.tags && video.tags.length > 0) {
        for (let i = 0; i < video.tags.length; i++) {
          if (video.tags[i].toLowerCase().includes(lowerQuery)) {
            matchesQuery = true;
            break;
          }
        }
      }
    }
    
    // Check if video matches tier requirement
    let matchesTier = true;
    if (tier !== null) {
      matchesTier = (video.tier === tier || video.tier === SubscriptionTier.BRONZE);
    }
    
    return matchesQuery && matchesTier;
  });
  
  return filtered;
}

// Get video by ID
export function getVideoById(id) {
  const allVideos = [
    ...loadVideosFromCatalog(VideoCategory.MEDITATION),
    ...loadVideosFromCatalog(VideoCategory.YOGA_FOR_PE),
    ...loadVideosFromCatalog(VideoCategory.RELAXATION)
  ];
  
  for (let i = 0; i < allVideos.length; i++) {
    if (allVideos[i].id === id) {
      return allVideos[i];
    }
  }
  
  return null;
}

// Get videos by category
export function getVideosByCategory(category, limit) {
  const videos = loadVideosFromCatalog(category);
  
  if (limit === undefined) {
    return videos;
  }
  
  return videos.slice(0, limit);
}

// Check if user has access to video
export function hasAccessToVideo(video, userTier) {
  if (!video) {
    return false;
  }
  
  if (!userTier) {
    return video.tier === SubscriptionTier.BRONZE;
  }
  
  return video.tier === SubscriptionTier.BRONZE || video.tier === userTier;
}

// Export enum constants for external use
export { VideoCategory, SubscriptionTier };
