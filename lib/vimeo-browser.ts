// Browser-compatible Vimeo utility
// This version uses standard Vimeo API with fetch

// Define subscription tiers
export enum SubscriptionTier {
  BRONZE = 0,  // Free tier
  SILVER = 1,  // $7.99/month
  GOLD = 2     // $9.99/month
}

// Define subscription tier details
export const subscriptionTierDetails = {
  [SubscriptionTier.BRONZE]: {
    name: 'Bronze',
    price: 0,
    description: 'Free access to select videos'
  },
  [SubscriptionTier.SILVER]: {
    name: 'Silver',
    price: 7.99,
    description: 'Access to Bronze and Silver content'
  },
  [SubscriptionTier.GOLD]: {
    name: 'Gold',
    price: 9.99,
    description: 'Access to all content including exclusive Gold videos'
  }
}

// Define video categories
export enum VideoCategory {
  MEDITATION = 'meditation',
  YOGA_FOR_PE = 'yoga-for-pe',
  RELAXATION = 'relaxation',
  MINDFUL_MOVEMENTS = 'mindful-movements'
}

// Define video interface
export interface Video {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  thumbnail?: string;
  vimeoId: string;
  tier: SubscriptionTier;
  category: VideoCategory;
}

// Helper function to get the Vimeo access token
function getVimeoToken(): string | null {
  // Check for browser environment
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN || null;
  } else {
    // Server-side
    return process.env.VIMEO_ACCESS_TOKEN || null;
  }
}

// Helper function to make requests to our Vimeo API proxy
const makeVimeoRequest = async (endpoint: string, params: Record<string, string> = {}): Promise<any> => {
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
    console.error(`Error fetching from Vimeo API (${endpoint}):`, error);
    if (error.name === 'AbortError') {
      console.error('Request timed out after 5 seconds');
    }
    throw error;
  }
};

// Map of category names to their Vimeo folder IDs or tags
// These will need to be updated with your actual folder IDs or tags once created
const categoryMappings: Record<VideoCategory, string> = {
  [VideoCategory.MEDITATION]: 'meditation',
  [VideoCategory.YOGA_FOR_PE]: 'yoga-for-pe',
  [VideoCategory.RELAXATION]: 'relaxation',
  [VideoCategory.MINDFUL_MOVEMENTS]: 'mindful-movements'
};

// Function to get videos by category with pagination
export async function getVideosByCategory(
  category: VideoCategory,
  page: number = 1,
  perPage: number = 3
): Promise<Video[]> {
  try {
    // Get the tag or folder for the category
    const categoryTag = categoryMappings[category];
    
    // Fetch videos from standard Vimeo API
    const response = await makeVimeoRequest('videos', {
      query: categoryTag, // Search for videos with this tag
      page: String(page),
      per_page: String(perPage),
      sort: 'date',
      direction: 'desc'
    });

    // Transform Vimeo API response to our Video interface
    return response.data.map((video: any) => ({
      id: video.resource_key || video.id,
      title: video.name,
      // Ensure description is properly associated with the video
      description: video.description || '',
      duration: formatDuration(video.duration),
      // Get level from metadata or default to Beginner
      level: getMetadataField(video, 'level') || 'Beginner',
      thumbnail: video.pictures?.sizes?.length > 0 ? video.pictures.sizes[3].link : '',
      vimeoId: video.uri.split('/').pop()!,
      // Get tier from metadata or determine based on tags
      tier: getVideoTier(video),
      category: category
    }));
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}

// Helper function to get metadata field from video
function getMetadataField(video: any, field: string): string {
  // Check if the video has metadata fields
  if (!video.metadata || !video.metadata.connections || !video.metadata.connections.custom_fields) {
    return '';
  }
  
  // Find the field in custom fields
  const customField = video.metadata.connections.custom_fields.options.find(
    (option: any) => option.name.toLowerCase() === field.toLowerCase()
  );
  
  return customField ? customField.value : '';
}

// Helper function to format duration in MM:SS format
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to determine subscription tier based on video tags or metadata
function getVideoTier(video: any): SubscriptionTier {
  // First check metadata for tier information
  const tierFromMetadata = getMetadataField(video, 'tier');
  if (tierFromMetadata) {
    if (tierFromMetadata.toLowerCase() === 'silver') return SubscriptionTier.SILVER;
    if (tierFromMetadata.toLowerCase() === 'gold') return SubscriptionTier.GOLD;
    if (tierFromMetadata.toLowerCase() === 'bronze') return SubscriptionTier.BRONZE;
  }
  
  // If no metadata, check tags
  const tags = video.tags || [];
  if (tags.some((tag: any) => tag.name.toLowerCase() === 'gold')) {
    return SubscriptionTier.GOLD;
  } else if (tags.some((tag: any) => tag.name.toLowerCase() === 'silver')) {
    return SubscriptionTier.SILVER;
  }
  
  // Default to Bronze (free)
  return SubscriptionTier.BRONZE;
}

// Function to check if a user has access to a video based on their subscription tier
export async function hasAccessToVideo(video: Video, userId?: string | null, userTier?: SubscriptionTier | null): Promise<boolean> {
  try {
    // For Bronze videos, allow access to everyone
    if (video.tier === SubscriptionTier.BRONZE) {
      return true;
    }
    
    // For Silver and Gold videos, require authentication and appropriate subscription
    // If no userId is provided, use the passed userTier
    if (!userId) {
      // If no userTier provided or null (unauthenticated), deny access to premium content
      if (userTier === null || userTier === undefined) {
        return false;
      }
      
      // Check access based on user's subscription tier
      if (userTier === SubscriptionTier.SILVER) {
        // Silver users can access Bronze and Silver content
        return video.tier <= SubscriptionTier.SILVER;
      } else if (userTier === SubscriptionTier.GOLD) {
        // Gold users can access all content
        return true;
      }
      
      // For Bronze users or any other case, deny access to premium content
      return false;
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
        console.log(`Checking access for video tier: ${video.tier}, user tier: ${userTier || 'not authenticated'}`);
        
        // Get the JWT token from localStorage
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('auth_token');
          console.log('JWT token available:', !!token);
        }
        
        // Set up headers with authorization if token exists
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/subscription/check-access?videoTier=${video.tier}`, {
          method: 'GET',
          headers,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Access check failed:', errorData);
          throw new Error(`Failed to check subscription access: ${errorData.error || response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Access check result for tier ${video.tier}: ${data.hasAccess ? 'GRANTED' : 'DENIED'}`);
        return data.hasAccess;
      } catch (error) {
        console.error('Error checking video access:', error);
        return false; // Default to no access on error
      }
    }
  } catch (error) {
    console.error('Error checking video access:', error);
    // Default to no access on error
    return false;
  }
}

// Function to get featured free videos for the homepage - one from each category
export async function getFeaturedFreeVideos(): Promise<Video[]> {
  // Define the specific videos we want to feature
  const featuredVideoIds = [
    '1095788590', // Yoga for PE - Ab Circle 1
    '452426275',  // Relaxation - Body Scan with Flowers
    '457053392'   // Meditation - I Am Meditation
  ];
  
  console.log('Fetching featured videos by IDs:', featuredVideoIds);
  
  // Custom descriptions for each video
  const customDescriptions: Record<string, string> = {
    '457053392': 'A guided meditation to help you connect with your inner self and find peace.',
    '1095788590': 'A fun, full-circle core workout that targets every major ab muscle in one dynamic loop.',
    '452426275': 'A relaxing body scan meditation to help you unwind and connect with your body.'
  };
  
  // Map each ID to its category
  const idToCategoryMap: Record<string, VideoCategory> = {
    '457053392': VideoCategory.MEDITATION,
    '1095788590': VideoCategory.YOGA_FOR_PE,
    '452426275': VideoCategory.RELAXATION
  };

  // Thumbnail paths for each video
  const thumbnailMap: Record<string, string> = {
    '457053392': '/thumbnails/meditation/I Am.jpg',
    '1095788590': '/thumbnails/yoga-for-pe/Ab Circle 1.jpg',
    '452426275': '/thumbnails/relaxation/Body Scan with Flowers.jpg'
  };
  
  // Fallback videos in case the API calls fail
  const fallbackVideos: Video[] = [
    {
      id: 457053392,
      title: 'I Am Meditation',
      description: 'A guided meditation to help you connect with your inner self and find peace.',
      duration: '1:08',
      level: 'Beginner',
      thumbnail: '/thumbnails/meditation/I Am.jpg',
      vimeoId: '457053392',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.MEDITATION
    },
    {
      id: 1095788590,
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
      id: 452426275,
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
    const featuredVideos: Video[] = [];

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
          description: customDescriptions[videoId] || data.description,
          duration: formatDuration(data.duration),
          level: 'All Levels',
          // Use our pre-defined thumbnail path for reliability
          thumbnail: thumbnailMap[videoId],
          vimeoId: videoId,
          tier: SubscriptionTier.BRONZE,
          category: idToCategoryMap[videoId]
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
function getThumbnailFolder(category: VideoCategory): string {
  switch(category) {
    case VideoCategory.MEDITATION: return 'meditation';
    case VideoCategory.YOGA_FOR_PE: return 'yoga-for-pe';
    case VideoCategory.RELAXATION: return 'relaxation';
    case VideoCategory.MINDFUL_MOVEMENTS: return 'mindful-movements';
    default: return 'yoga-for-pe';
  }
}

// Helper function to add thumbnail paths to videos based on their title and category
export function ensureThumbnailPath(video: Video): Video {
  // Keep existing thumbnail if it's already a local path
  if (video.thumbnail && video.thumbnail.startsWith('/thumbnails/')) {
    return video;
  }
  
  // Get the appropriate folder based on category
  const folder = getThumbnailFolder(video.category);
  
  // Simple direct thumbnail path
  return {
    ...video,
    thumbnail: `/thumbnails/${folder}/${encodeURIComponent(video.title)}.jpg`
  };
}

// Helper function to determine video category from tags or metadata
export function determineVideoCategory(video: any): VideoCategory {
  // First check metadata
  const categoryFromMetadata = getMetadataField(video, 'category');
  if (categoryFromMetadata) {
    if (categoryFromMetadata.toLowerCase() === 'meditation') return VideoCategory.MEDITATION;
    if (categoryFromMetadata.toLowerCase() === 'yoga-for-pe') return VideoCategory.YOGA_FOR_PE;
    if (categoryFromMetadata.toLowerCase() === 'relaxation') return VideoCategory.RELAXATION;
  }
  
  // Check tags
  const tags = video.tags || [];
  if (tags.some((tag: any) => tag.name.toLowerCase() === 'meditation')) {
    return VideoCategory.MEDITATION;
  } else if (tags.some((tag: any) => tag.name.toLowerCase() === 'yoga-for-pe')) {
    return VideoCategory.YOGA_FOR_PE;
  } else if (tags.some((tag: any) => tag.name.toLowerCase() === 'relaxation')) {
    return VideoCategory.RELAXATION;
  }
  
  // Default to YOGA_FOR_PE if we can't determine
  return VideoCategory.YOGA_FOR_PE;
}


