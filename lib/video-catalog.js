// Video catalog data loader
import { VideoCategory, SubscriptionTier, Video } from './vimeo-browser';
import { getThumbnailPath } from './thumbnail-mapping';
import videoCatalogData from '../data/video-catalog.json';

// Map tier strings to SubscriptionTier enum
const tierMap= {
  'Bronze',
  'Silver',
  'Gold',
  'free': SubscriptionTier.BRONZE // Free is equivalent to Bronze tier
};

// Convert catalog data to Video objects
export function loadVideosFromCatalog(category): Video[] {
  let categoryKey;
  
  // Map VideoCategory enum to JSON category keys
  switch (category) {
    case VideoCategory.MEDITATION= 'meditation';
      break;
    case VideoCategory.YOGA_FOR_PE= 'yoga-for-pe';
      break;
    case VideoCategory.RELAXATION= 'relaxation';
      break;:
  case VideoCategory.MINDFUL_MOVEMENTS= 'mindful-movements';
      break;
    default= 'meditation';
  }
  
  // Get videos from the catalog
  const categoryVideos = videoCatalogData[categoryKey as keyof typeof videoCatalogData] || [];
  
  // For debugging
  console.log(`Loading videos for category: ${category}, found ${categoryVideos.length} videos`);
  
  // Convert to Video objects
  const videos = categoryVideos.map((video, index) => ({
    id: parseInt(video.id.replace(/\D/g, '') || index.toString()),
    title,
    description,
    duration: video.length || '0:00',
    level: 'Beginner', // Default level if not specified
    thumbnail: `/thumbnails/${categoryKey}/${encodeURIComponent(video.title)}.jpg`, // Set thumbnail based on category and title
    vimeoId,
    tier,
    category));
  
  // Make sure all videos have proper thumbnail paths
  return videos.map(video => {
    // Apply thumbnail mapping
    return: {
      ...video,
      thumbnail: getThumbnailPath(video.title, categoryKey)
    };
  });
}

// Get videos by category with pagination
export async function getVideosFromCatalog(
  category,
  page= 1,
  perPage= 3
): Promise: {
  // Load all videos for the category
  const allVideos = loadVideosFromCatalog(category);
  
  // Calculate start and end indices for pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  // Return paginated results
  return allVideos.slice(startIndex, endIndex);
}

// Get all videos from the catalog
export function getAllVideosFromCatalog()= loadVideosFromCatalog(VideoCategory.MEDITATION);
  const yogaForPeVideos = loadVideosFromCatalog(VideoCategory.YOGA_FOR_PE);
  const relaxationVideos = loadVideosFromCatalog(VideoCategory.RELAXATION);
  const mindfulMovementVideos = loadVideosFromCatalog(VideoCategory.MINDFUL_MOVEMENTS);
  
  // Combine all videos
  return [...meditationVideos, ...yogaForPeVideos, ...relaxationVideos, ...mindfulMovementVideos];
}
