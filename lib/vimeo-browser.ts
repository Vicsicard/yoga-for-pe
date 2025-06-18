// Browser-compatible Vimeo utility
// This version doesn't use the Node.js SDK which requires 'fs'

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
    description: 'A guided journey to help students visualize success and calm',
    duration: '12:45',
    level: 'Intermediate',
    thumbnail: '/images/video-thumbnail2.jpg',
    vimeoId: '123456790',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.MEDITATION
  },
  {
    id: 3,
    title: 'Advanced Meditation for Focus',
    description: 'Deeper meditation practices for improved concentration and mental clarity',
    duration: '15:20',
    level: 'Advanced',
    thumbnail: '/images/video-thumbnail3.jpg',
    vimeoId: '123456791',
    tier: SubscriptionTier.GOLD,
    category: VideoCategory.MEDITATION
  },
  {
    id: 10,
    title: 'Quick Classroom Mindfulness',
    description: '5-minute mindfulness exercises perfect for classroom transitions',
    duration: '5:15',
    level: 'Beginner',
    thumbnail: '/images/video-thumbnail10.jpg',
    vimeoId: '123456798',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.MEDITATION
  },
  {
    id: 11,
    title: 'Body Scan Meditation for Teens',
    description: 'A guided body scan meditation specifically designed for teenage students',
    duration: '10:30',
    level: 'Intermediate',
    thumbnail: '/images/video-thumbnail11.jpg',
    vimeoId: '123456799',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.MEDITATION
  },
  {
    id: 12,
    title: 'Mindfulness for Test Anxiety',
    description: 'Meditation techniques to help students manage test anxiety',
    duration: '18:45',
    level: 'Advanced',
    thumbnail: '/images/video-thumbnail12.jpg',
    vimeoId: '123456800',
    tier: SubscriptionTier.GOLD,
    category: VideoCategory.MEDITATION
  },
  
  // Yoga for PE videos
  {
    id: 4,
    title: 'Introduction to Yoga for PE',
    description: 'A comprehensive introduction to implementing yoga in physical education classes',
    duration: '10:15',
    level: 'Beginner',
    thumbnail: '/images/video-thumbnail4.jpg',
    vimeoId: '123456792',
    tier: SubscriptionTier.BRONZE,
    category: VideoCategory.YOGA_FOR_PE
  },
  {
    id: 5,
    title: 'Partner Yoga for Students',
    description: 'Fun and engaging partner yoga poses perfect for PE classes',
    duration: '14:30',
    level: 'Intermediate',
    thumbnail: '/images/video-thumbnail5.jpg',
    vimeoId: '123456793',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.YOGA_FOR_PE
  },
  {
    id: 6,
    title: 'Yoga for Student Athletes',
    description: 'Specialized yoga sequences to enhance athletic performance and prevent injuries',
    duration: '20:45',
    level: 'Advanced',
    thumbnail: '/images/video-thumbnail6.jpg',
    vimeoId: '123456794',
    tier: SubscriptionTier.GOLD,
    category: VideoCategory.YOGA_FOR_PE
  },
  {
    id: 13,
    title: 'Yoga Games for Elementary PE',
    description: 'Fun yoga-based games and activities for elementary PE classes',
    duration: '12:20',
    level: 'Beginner',
    thumbnail: '/images/video-thumbnail13.jpg',
    vimeoId: '123456801',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.YOGA_FOR_PE
  },
  {
    id: 14,
    title: 'Yoga Sequences for Middle School',
    description: 'Age-appropriate yoga sequences designed for middle school students',
    duration: '15:10',
    level: 'Intermediate',
    thumbnail: '/images/video-thumbnail14.jpg',
    vimeoId: '123456802',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.YOGA_FOR_PE
  },
  {
    id: 15,
    title: 'Yoga for High School Fitness',
    description: 'Challenging yoga practices suitable for high school fitness programs',
    duration: '22:30',
    level: 'Advanced',
    thumbnail: '/images/video-thumbnail15.jpg',
    vimeoId: '123456803',
    tier: SubscriptionTier.GOLD,
    category: VideoCategory.YOGA_FOR_PE
  },
  
  // Relaxation videos
  {
    id: 7,
    title: 'Quick Classroom Relaxation',
    description: 'Brief relaxation techniques that can be done in any classroom setting',
    duration: '7:20',
    level: 'Beginner',
    thumbnail: '/images/video-thumbnail7.jpg',
    vimeoId: '123456795',
    tier: SubscriptionTier.BRONZE,
    category: VideoCategory.RELAXATION
  },
  {
    id: 8,
    title: 'Stress Relief for Students',
    description: 'Effective techniques to help students manage academic stress',
    duration: '13:10',
    level: 'Intermediate',
    thumbnail: '/images/video-thumbnail8.jpg',
    vimeoId: '123456796',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.RELAXATION
  },
  {
    id: 9,
    title: 'Deep Relaxation Practices',
    description: 'Advanced relaxation methods for deep stress relief and improved well-being',
    duration: '18:30',
    level: 'Advanced',
    thumbnail: '/images/video-thumbnail9.jpg',
    vimeoId: '123456797',
    tier: SubscriptionTier.GOLD,
    category: VideoCategory.RELAXATION
  },
  {
    id: 16,
    title: 'Relaxation for Test Preparation',
    description: 'Relaxation techniques specifically designed to help students prepare for exams',
    duration: '9:45',
    level: 'Beginner',
    thumbnail: '/images/video-thumbnail16.jpg',
    vimeoId: '123456804',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.RELAXATION
  },
  {
    id: 17,
    title: 'Guided Relaxation for Teens',
    description: 'Guided relaxation sessions tailored for teenage students',
    duration: '14:50',
    level: 'Intermediate',
    thumbnail: '/images/video-thumbnail17.jpg',
    vimeoId: '123456805',
    tier: SubscriptionTier.SILVER,
    category: VideoCategory.RELAXATION
  },
  {
    id: 18,
    title: 'Progressive Muscle Relaxation',
    description: 'Comprehensive progressive muscle relaxation technique for deep stress relief',
    duration: '22:15',
    level: 'Advanced',
    thumbnail: '/images/video-thumbnail18.jpg',
    vimeoId: '123456806',
    tier: SubscriptionTier.GOLD,
    category: VideoCategory.RELAXATION
  }
];

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

// Function to get featured free videos for the homepage
export function getFeaturedFreeVideos(): Video[] {
  // In a real implementation, we would fetch featured free videos from Vimeo OTT API
  // For now, we'll return one free video from each category
  
  // Get all free (Bronze tier) videos
  const freeVideos = MOCK_VIDEOS.filter(video => video.tier === SubscriptionTier.BRONZE);
  
  // Get one free video from each category
  const meditationVideo = freeVideos.find(video => video.category === VideoCategory.MEDITATION);
  const yogaForPeVideo = freeVideos.find(video => video.category === VideoCategory.YOGA_FOR_PE);
  const relaxationVideo = freeVideos.find(video => video.category === VideoCategory.RELAXATION);
  
  // Return the featured videos (one from each category)
  return [meditationVideo, yogaForPeVideo, relaxationVideo].filter(Boolean) as Video[];
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
