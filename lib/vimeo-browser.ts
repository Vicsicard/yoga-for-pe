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
  RELAXATION = 'relaxation'
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
    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      throw new Error(`Vimeo API request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Map of category names to their Vimeo folder IDs or tags
// These will need to be updated with your actual folder IDs or tags once created
const categoryMappings: Record<VideoCategory, string> = {
  [VideoCategory.MEDITATION]: 'meditation',
  [VideoCategory.YOGA_FOR_PE]: 'yoga-for-pe',
  [VideoCategory.RELAXATION]: 'relaxation'
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
export async function hasAccessToVideo(video: Video, userTier: SubscriptionTier = SubscriptionTier.BRONZE): Promise<boolean> {
  try {
    // Users can access videos of their tier or lower
    return userTier >= video.tier;
  } catch (error) {
    console.error('Error checking video access:', error);
    // Default to no access on error
    return false;
  }
}

// Function to get featured free videos for the homepage - one from each category
export async function getFeaturedFreeVideos(): Promise<Video[]> {
  try {
    // Define the specific videos we want to feature (IDs from tag-featured-videos.js)
    const featuredVideoIds = [
      '457053392', // Meditation - I Am Meditation 1
      '1095788590', // Yoga for PE - Ab Circle 1
      '452426275'  // Relaxation - Zenevate Body Scan
    ];
    
    console.log('Fetching featured videos by IDs:', featuredVideoIds);
    
    const featuredVideos: Video[] = [];
    
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
    
    // Fetch each video directly by ID
    for (const videoId of featuredVideoIds) {
      try {
        console.log(`Fetching video with ID: ${videoId}`);
        
        // Direct fetch by ID
        const response = await makeVimeoRequest(`videos/${videoId}`, {});
        
        if (response) {
          const video = response;
          const category = idToCategoryMap[videoId as keyof typeof idToCategoryMap];
          const description = customDescriptions[videoId as keyof typeof customDescriptions];
          
          console.log(`Adding video: ${video.name} (${category})`);
          
          featuredVideos.push({
            id: video.resource_key || video.id,
            title: video.name,
            description: description, // Use our custom description
            duration: formatDuration(video.duration),
            level: getMetadataField(video, 'level') || 'Beginner',
            thumbnail: video.pictures?.sizes?.length > 0 ? video.pictures.sizes[3].link : '',
            vimeoId: videoId,
            tier: SubscriptionTier.BRONZE,
            category: category
          });
        } else {
          console.log(`No video found with ID: ${videoId}`);
        }
      } catch (videoError) {
        console.error(`Error fetching video ${videoId}:`, videoError);
      }
    }
    
    console.log('Final featured videos:', featuredVideos.map(v => `${v.title} (${v.category})`));
    return featuredVideos;
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    // Return empty array instead of throwing
    return [];
  }
}

// Helper function to determine video category from tags or metadata
function determineVideoCategory(video: any): VideoCategory {
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


