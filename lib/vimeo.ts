// This is a browser-compatible version of the Vimeo utility
// We'll use mock data for now and later integrate with Vimeo OTT API using fetch
// instead of the Node.js SDK which requires 'fs'

// For real implementation, we would use:
// const VIMEO_OTT_API_KEY = process.env.NEXT_PUBLIC_VIMEO_OTT_API_KEY || '';

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

// Function to get videos by category with pagination
export async function getVideosByCategory(
  category: VideoCategory,
  page: number = 1,
  perPage: number = 3
): Promise<Video[]> {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // This would be replaced with actual Vimeo API calls
      const videos = getMockVideos(category, page, perPage);
      resolve(videos);
    }, 300);
  });
}

// Function to check if a user has access to a video based on their subscription tier
export function hasAccessToVideo(video: Video, userTier: SubscriptionTier = SubscriptionTier.BRONZE): boolean {
  // In a real implementation, we would check the user's subscription tier from Vimeo OTT
  // For now, we'll use the mock user tier
  
  // Users can access videos of their tier or lower
  return userTier >= video.tier;
}

// Mock data function - will be replaced with actual Vimeo API calls
function getMockVideos(category: VideoCategory, page: number = 1, perPage: number = 3): Video[] {
  // Filter by category
  const filteredVideos = MOCK_VIDEOS.filter(video => video.category === category);
  
  // Calculate pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  // Return paginated results
  return filteredVideos.slice(startIndex, endIndex);
}

// Mock videos data
const MOCK_VIDEOS: Video[] = [
    // Meditation videos
    {
      id: 1,
      title: 'Mindful Breathing Techniques',
      description: 'Simple breathing exercises to help students center and focus',
      duration: '8:30',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail1.jpg',
      vimeoId: '123456789',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.MEDITATION
    },
    {
      id: 2,
      title: 'Guided Visualization for Students',
      description: 'Help students develop imagination and focus through guided imagery',
      duration: '12:45',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail2.jpg',
      vimeoId: '123456790',
      tier: SubscriptionTier.SILVER,
      category: VideoCategory.MEDITATION
    },
    {
      id: 3,
      title: 'Mindfulness for Test Anxiety',
      description: 'Techniques to help students manage stress before exams',
      duration: '10:20',
      level: 'Intermediate',
      thumbnail: '/images/video-thumbnail3.jpg',
      vimeoId: '123456791',
      tier: SubscriptionTier.GOLD,
      category: VideoCategory.MEDITATION
    },
    {
      id: 10,
      title: 'Advanced Meditation Practices',
      description: 'Deeper meditation techniques for experienced practitioners',
      duration: '15:45',
      level: 'Advanced',
      thumbnail: '/images/video-thumbnail10.jpg',
      vimeoId: '123456798',
      tier: SubscriptionTier.GOLD,
      category: VideoCategory.MEDITATION
    },
    {
      id: 11,
      title: 'Quick Classroom Mindfulness',
      description: '5-minute mindfulness exercises for busy classrooms',
      duration: '5:30',
      level: 'All Levels',
      thumbnail: '/images/video-thumbnail11.jpg',
      vimeoId: '123456799',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.MEDITATION
    },
    {
      id: 12,
      title: 'Body Scan Meditation',
      description: 'Guided body awareness meditation for stress relief',
      duration: '9:15',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail12.jpg',
      vimeoId: '123456800',
      tier: SubscriptionTier.SILVER,
      category: VideoCategory.MEDITATION
    },
    
    // Yoga for PE videos
    {
      id: 4,
      title: 'Introduction to Yoga for PE',
      description: 'A comprehensive introduction to implementing yoga in physical education classes',
      duration: '15:30',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail4.jpg',
      vimeoId: '123456792',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: 5,
      title: 'Sun Salutation Series',
      description: 'A simple flow sequence perfect for classroom warm-ups',
      duration: '12:45',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail5.jpg',
      vimeoId: '123456793',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: 6,
      title: 'Partner Yoga Activities',
      description: 'Fun partner exercises to build trust and cooperation',
      duration: '22:30',
      level: 'Intermediate',
      thumbnail: '/images/video-thumbnail6.jpg',
      vimeoId: '123456794',
      tier: SubscriptionTier.SILVER,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: 13,
      title: 'Balance Poses for Focus',
      description: 'Improve concentration with these balance-focused yoga poses',
      duration: '18:20',
      level: 'Intermediate',
      thumbnail: '/images/video-thumbnail13.jpg',
      vimeoId: '123456801',
      tier: SubscriptionTier.SILVER,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: 14,
      title: 'Yoga for Athletic Performance',
      description: 'Enhance sports performance with these targeted yoga sequences',
      duration: '25:10',
      level: 'Advanced',
      thumbnail: '/images/video-thumbnail14.jpg',
      vimeoId: '123456802',
      tier: SubscriptionTier.GOLD,
      category: VideoCategory.YOGA_FOR_PE
    },
    {
      id: 15,
      title: 'Inclusive Yoga Adaptations',
      description: 'Modifications to make yoga accessible for all students',
      duration: '20:45',
      level: 'All Levels',
      thumbnail: '/images/video-thumbnail15.jpg',
      vimeoId: '123456803',
      tier: SubscriptionTier.GOLD,
      category: VideoCategory.YOGA_FOR_PE
    },
    
    // Relaxation videos
    {
      id: 7,
      title: 'Yoga Cool-Down Routine',
      description: 'End your PE class with this calming cool-down sequence',
      duration: '10:15',
      level: 'All Levels',
      thumbnail: '/images/video-thumbnail7.jpg',
      vimeoId: '123456795',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.RELAXATION
    },
    {
      id: 8,
      title: 'Restorative Yoga for Students',
      description: 'Gentle poses to help students release tension and restore energy',
      duration: '18:20',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail8.jpg',
      vimeoId: '123456796',
      tier: SubscriptionTier.SILVER,
      category: VideoCategory.RELAXATION
    },
    {
      id: 9,
      title: 'Stress Relief Techniques',
      description: 'Quick and effective methods to reduce stress during the school day',
      duration: '15:45',
      level: 'All Levels',
      thumbnail: '/images/video-thumbnail9.jpg',
      vimeoId: '123456797',
      tier: SubscriptionTier.GOLD,
      category: VideoCategory.RELAXATION
    },
    {
      id: 16,
      title: 'Guided Relaxation for Children',
      description: 'Age-appropriate relaxation exercises for elementary students',
      duration: '12:30',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail16.jpg',
      vimeoId: '123456804',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.RELAXATION
    },
    {
      id: 17,
      title: 'Tension Release for Teens',
      description: 'Targeted relaxation techniques for adolescents',
      duration: '14:50',
      level: 'Intermediate',
      thumbnail: '/images/video-thumbnail17.jpg',
      vimeoId: '123456805',
      tier: SubscriptionTier.SILVER,
      category: VideoCategory.RELAXATION
    },
    {
      id: 18,
      title: 'Deep Relaxation Practices',
      description: 'Advanced techniques for complete mind-body relaxation',
      duration: '22:15',
      level: 'Advanced',
      thumbnail: '/images/video-thumbnail18.jpg',

// Function to get featured free videos for the homepage
export function getFeaturedFreeVideos(): Video[] {
  // In a real implementation, we would fetch featured free videos from Vimeo OTT API
  // For now, we'll return 3 mock free videos
  // Filter mock videos to get free (Bronze tier) ones
  return MOCK_VIDEOS
    .filter(video => video.tier === SubscriptionTier.BRONZE)
    .slice(0, 3);
      id: 4,
      title: 'Introduction to Yoga for PE',
      description: 'A comprehensive introduction to implementing yoga in physical education classes',
      duration: '15:30',
      level: 'Beginner',
      thumbnail: '/images/video-thumbnail4.jpg',
      vimeoId: '123456792',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.YOGA_FOR_PE
    },
    // One free relaxation video
    {
      id: 7,
      title: 'Yoga Cool-Down Routine',
      description: 'End your PE class with this calming cool-down sequence',
      duration: '10:15',
      level: 'All Levels',
      thumbnail: '/images/video-thumbnail7.jpg',
      vimeoId: '123456795',
      tier: SubscriptionTier.BRONZE,
      category: VideoCategory.RELAXATION
    }
  ];
}

export default vimeoClient;
