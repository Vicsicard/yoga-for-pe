// Browser-compatible Vimeo utility
// This version uses Vimeo OTT API directly with fetch

// Define subscription tiers
export enum SubscriptionTier {
  BRONZE = 0,  // Free tier
  SILVER = 1,  // $7.99/month
  GOLD = 2     // $9.99/month
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

// Helper function to make requests to our Vimeo OTT API proxy
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

// Function to get videos by category with pagination
export async function getVideosByCategory(
  category: VideoCategory,
  page: number = 1,
  perPage: number = 3
): Promise<Video[]> {
  try {
    // Fetch videos from Vimeo OTT API
    const response = await makeVimeoRequest('videos', {
      category: category,
      page: String(page),
      per_page: String(perPage),
      sort: 'created_time',
      direction: 'desc'
    });

    // Transform Vimeo API response to our Video interface
    return response.data.map((video: any) => ({
      id: video.id,
      title: video.name,
      description: video.description || '',
      duration: formatDuration(video.duration),
      level: video.metadata?.level || 'Beginner',
      thumbnail: video.pictures.sizes[0].link,
      vimeoId: video.uri.split('/').pop()!,
      tier: getSubscriptionTier(video.price),
      category: video.metadata?.category as VideoCategory
    }));
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

// Helper function to format duration in MM:SS format
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to determine subscription tier based on price
function getSubscriptionTier(price: number | null): SubscriptionTier {
  if (price === null) return SubscriptionTier.BRONZE; // Free
  if (price <= 7.99) return SubscriptionTier.SILVER;
  return SubscriptionTier.GOLD;
}

// Function to check if a user has access to a video based on their subscription tier
export async function hasAccessToVideo(video: Video, userTier: SubscriptionTier = SubscriptionTier.BRONZE): Promise<boolean> {
  try {
    // In a real implementation, we would check the user's subscription tier from Vimeo OTT
    // For now, we'll use the mock user tier
    
    // Users can access videos of their tier or lower
    return userTier >= video.tier;
  } catch (error) {
    console.error('Error checking video access:', error);
    throw error;
  }
}

// Function to get featured free videos for the homepage
export async function getFeaturedFreeVideos(): Promise<Video[]> {
  try {
    // Fetch featured free videos from Vimeo OTT
    const response = await makeVimeoRequest('videos', {
      price: '0',
      limit: '3',
      sort: 'created_time',
      direction: 'desc'
    });

    // Transform Vimeo API response to our Video interface
    return response.data.map((video: any) => ({
      id: video.id,
      title: video.name,
      description: video.description || '',
      duration: formatDuration(video.duration),
      level: video.metadata?.level || 'Beginner',
      thumbnail: video.pictures.sizes[0].link,
      vimeoId: video.uri.split('/').pop()!,
      tier: SubscriptionTier.BRONZE,
      category: video.metadata?.category as VideoCategory
    }));
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    throw error;
  }
}


