// Video catalog data loader
import { VideoCategory, SubscriptionTier, Video } from './vimeo-browser';
import { getThumbnailPath } from './thumbnail-mapping';
import videoCatalogData from '../data/video-catalog.json';

// Map tier strings to SubscriptionTier enum
const tierMap: Record<string, SubscriptionTier> = {
  'Bronze': SubscriptionTier.BRONZE,
  'Silver': SubscriptionTier.SILVER,
  'Gold': SubscriptionTier.GOLD,
  'free': SubscriptionTier.BRONZE // Free is equivalent to Bronze tier
};

// Convert catalog data to Video objects
export function loadVideosFromCatalog(category: VideoCategory): Video[] {
  let categoryKey: string;
  
  // Map VideoCategory enum to JSON category keys
  switch (category) {
    case VideoCategory.MEDITATION:
      categoryKey = 'meditation';
      break;
    case VideoCategory.YOGA_FOR_PE:
      categoryKey = 'yoga-for-pe';
      break;
    case VideoCategory.RELAXATION:
      categoryKey = 'relaxation';
      break;
    case VideoCategory.MINDFUL_MOVEMENTS:
      categoryKey = 'mindful-movements';
      break;
    default:
      categoryKey = 'meditation';
  }
  
  // Get videos from the catalog
  const categoryVideos = videoCatalogData[categoryKey as keyof typeof videoCatalogData] || [];
  
  // For debugging
  console.log(`Loading videos for category: ${category}, found ${categoryVideos.length} videos`);
  
  // Convert to Video objects
  const videos = categoryVideos.map((video: any, index: number) => ({
    id: parseInt(video.id.replace(/\D/g, '') || index.toString()),
    title: video.title,
    description: video.description,
    duration: video.length || '0:00',
    level: 'Beginner', // Default level if not specified
    thumbnail: video.id ? `https://vumbnail.com/${video.id}.jpg` : `/thumbnails/${categoryKey}/${encodeURIComponent(video.title)}.jpg`, // Use Vimeo thumbnail if available
    vimeoId: video.id,
    tier: tierMap[video.tier] || SubscriptionTier.BRONZE,
    category: category
  }));
  
  // Make sure all videos have proper thumbnail paths
  return videos.map(video => {
    // Apply thumbnail mapping
    return {
      ...video,
      thumbnail: getThumbnailPath(video.title, categoryKey)
    };
  });
}

// Get videos by category with pagination
export async function getVideosFromCatalog(
  category: VideoCategory,
  page: number = 1,
  perPage: number = 3
): Promise<Video[]> {
  // Load all videos for the category
  const allVideos = loadVideosFromCatalog(category);
  
  // Calculate start and end indices for pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  // Return paginated results
  return allVideos.slice(startIndex, endIndex);
}

// Get all videos from the catalog
export function getAllVideosFromCatalog(): Video[] {
  const meditationVideos = loadVideosFromCatalog(VideoCategory.MEDITATION);
  const yogaForPeVideos = loadVideosFromCatalog(VideoCategory.YOGA_FOR_PE);
  const relaxationVideos = loadVideosFromCatalog(VideoCategory.RELAXATION);
  const mindfulMovementVideos = loadVideosFromCatalog(VideoCategory.MINDFUL_MOVEMENTS);
  
  // Combine all videos
  return [...meditationVideos, ...yogaForPeVideos, ...relaxationVideos, ...mindfulMovementVideos];
}
