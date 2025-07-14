'use client'

import { useState, useEffect } from 'react'
import { VideoCategory, SubscriptionTier, Video, hasAccessToVideo } from '../../lib/vimeo-browser'
import { getVideosFromCatalog, getAllVideosFromCatalog } from '../../lib/video-catalog'
import { useAuth } from '../../lib/contexts/AuthContext'

// Import our modular components
import VideoPlayer from '../../components/VideoPlayer'
import VideoSection from '../../components/VideoSection'
import VideoSearchFilter from '../../components/VideoSearchFilter'
import FilteredVideoResults from '../../components/FilteredVideoResults'
import PremiumModal from '../../components/PremiumModal'
import SubscriptionCTA from '../../components/SubscriptionCTA'

// Section definitions
const videoSections = [
  {
    id: VideoCategory.YOGA_FOR_PE,
    title: 'Yoga for PE',
    description: 'Bring the benefits of yoga to your PE curriculum with these classroom-ready sequences and activities.',
  },
  {
    id: VideoCategory.RELAXATION,
    title: 'Relaxation',
    description: 'Help students unwind, restore, and find balance with these calming sequences and techniques.',
  },
  {
    id: VideoCategory.MEDITATION,
    title: 'Meditation',
    description: 'Take a breath—you\'ve got this. Mindfulness offers simple, science-backed tools to help you feel calmer, more focused, and grounded.',
  },
  {
    id: VideoCategory.MINDFUL_MOVEMENTS,
    title: 'Mindful Movements',
    description: 'Positive, inspirational songs set to yoga and functional strength movements for cardio workouts and SEL discussions.',
  }
];

export default function VideosPage() {
  // Get user authentication and subscription status
  const { user, isAuthenticated } = useAuth();
  
  // Search and filter state
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  
  // Video player state
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  
  // State for videos in each category with pagination
  const [meditationVideos, setMeditationVideos] = useState<Video[]>([])
  const [yogaForPeVideos, setYogaForPeVideos] = useState<Video[]>([])
  const [relaxationVideos, setRelaxationVideos] = useState<Video[]>([])
  const [mindfulMovementsVideos, setMindfulMovementsVideos] = useState<Video[]>([])
  
  // State for displayed videos in each category (3 or 6 at a time)
  const [displayedMeditationVideos, setDisplayedMeditationVideos] = useState<Video[]>([])
  const [displayedYogaForPeVideos, setDisplayedYogaForPeVideos] = useState<Video[]>([])
  const [displayedRelaxationVideos, setDisplayedRelaxationVideos] = useState<Video[]>([])
  const [displayedMindfulMovementsVideos, setDisplayedMindfulMovementsVideos] = useState<Video[]>([])
  
  // State for tracking which sections are expanded (showing 6 videos instead of 3)
  const [isMeditationExpanded, setIsMeditationExpanded] = useState(false)
  const [isYogaForPeExpanded, setIsYogaForPeExpanded] = useState(false)
  const [isRelaxationExpanded, setIsRelaxationExpanded] = useState(false)
  const [isMindfulMovementsExpanded, setIsMindfulMovementsExpanded] = useState(false)
  
  // State for current display index in each category
  const [meditationStartIndex, setMeditationStartIndex] = useState(0)
  const [yogaForPeStartIndex, setYogaForPeStartIndex] = useState(0)
  const [relaxationStartIndex, setRelaxationStartIndex] = useState(0)
  const [mindfulMovementsStartIndex, setMindfulMovementsStartIndex] = useState(0)
  
  // State for loading status in each category
  const [isLoadingMeditation, setIsLoadingMeditation] = useState(false)
  const [isLoadingYoga, setIsLoadingYoga] = useState(false)
  const [isLoadingRelaxation, setIsLoadingRelaxation] = useState(false)
  const [isLoadingMindfulMovements, setIsLoadingMindfulMovements] = useState(false)
  
  // State for pagination in each category
  const [meditationPage, setMeditationPage] = useState(1)
  const [yogaForPePage, setYogaForPePage] = useState(1)
  const [relaxationPage, setRelaxationPage] = useState(1)
  const [mindfulMovementsPage, setMindfulMovementsPage] = useState(1)
  
  // Get subscription tier from user authentication
  // Default to null if not authenticated (will block premium content)
  const [userSubscriptionTier, setUserSubscriptionTier] = useState<SubscriptionTier | null>(null)
  
  // Update subscription tier when user auth changes
  useEffect(() => {
    // If user is authenticated and has a subscription plan
    if (isAuthenticated && user?.subscription?.plan) {
      // Convert string plan name to SubscriptionTier enum
      switch(user.subscription.plan.toLowerCase()) {
        case 'silver':
          setUserSubscriptionTier(SubscriptionTier.SILVER);
          break;
        case 'gold':
          setUserSubscriptionTier(SubscriptionTier.GOLD);
          break;
        default:
          setUserSubscriptionTier(SubscriptionTier.BRONZE);
      }
    } else if (isAuthenticated) {
      // Authenticated but no subscription = Bronze tier
      setUserSubscriptionTier(SubscriptionTier.BRONZE);
    } else {
      // Not authenticated = null (will block premium content)
      setUserSubscriptionTier(null);
    }
  }, [user, isAuthenticated])
  
  // Load initial videos for each category
  useEffect(() => {
    const fetchInitialVideos = async () => {
      setIsLoadingMeditation(true);
      setIsLoadingYoga(true);
      setIsLoadingRelaxation(true);
      setIsLoadingMindfulMovements(true);
      
      try {
        // Fetch videos from our catalog data
        const meditationData = await getVideosFromCatalog(VideoCategory.MEDITATION, 1, 9);
        const yogaForPeData = await getVideosFromCatalog(VideoCategory.YOGA_FOR_PE, 1, 9);
        const relaxationData = await getVideosFromCatalog(VideoCategory.RELAXATION, 1, 9);
        const mindfulMovementsData = await getVideosFromCatalog(VideoCategory.MINDFUL_MOVEMENTS, 1, 9);
        
        // Set all videos
        setMeditationVideos(meditationData || []);
        setYogaForPeVideos(yogaForPeData || []);
        setRelaxationVideos(relaxationData || []);
        setMindfulMovementsVideos(mindfulMovementsData || []);
        
        // Set initial displayed videos (first 3 of each category)
        setDisplayedMeditationVideos(meditationData ? meditationData.slice(0, 3) : []);
        setDisplayedYogaForPeVideos(yogaForPeData ? yogaForPeData.slice(0, 3) : []);
        setDisplayedRelaxationVideos(relaxationData ? relaxationData.slice(0, 3) : []);
        setDisplayedMindfulMovementsVideos(mindfulMovementsData ? mindfulMovementsData.slice(0, 3) : []);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoadingMeditation(false);
        setIsLoadingYoga(false);
        setIsLoadingRelaxation(false);
        setIsLoadingMindfulMovements(false);
      }
    };
    
    fetchInitialVideos();
  }, []);
  
  // Utility function to ensure we always have exactly 6 videos
  // If there aren't enough unique videos, it will cycle through the available ones
  const ensureExactlySixVideos = (videos: Video[], startIndex: number = 0): Video[] => {
    if (!videos || videos.length === 0) return [];
    
    // Prepare result array to hold exactly 6 videos
    const result: Video[] = [];
    
    // Fill the result with 6 videos, cycling through the available ones if needed
    for (let i = 0; i < 6; i++) {
      const index = (startIndex + i) % videos.length;
      result.push(videos[index]);
    }
    
    return result;
  };
  
  // Function to load more videos for a specific category
  const loadMoreVideos = async (category: VideoCategory) => {
    switch (category) {
      case VideoCategory.MEDITATION:
        setIsLoadingMeditation(true);
        try {
          // Toggle expanded state if not expanded yet
          if (!isMeditationExpanded) {
            setIsMeditationExpanded(true);
            
            // If we don't have enough videos, fetch more first
            if (meditationVideos.length < 6) {
              const newVideos = await getVideosFromCatalog(VideoCategory.MEDITATION, meditationPage + 1, 6);
              if (newVideos.length > 0) {
                setMeditationVideos(prev => [...prev, ...newVideos]);
                setMeditationPage(meditationPage + 1);
              }
            }
            
            // Always ensure we display exactly 6 videos
            const sixVideos = ensureExactlySixVideos(meditationVideos, 0);
            setDisplayedMeditationVideos(sixVideos);
            setMeditationStartIndex(0); // Track that we're showing from the beginning
          } else {
            // Already expanded, replace the bottom row (last 3 videos)
            
            // Calculate the next 3 videos to show
            const nextStartIndex = (meditationStartIndex + 3) % meditationVideos.length;
            
            // Keep the top row intact
            const topRow = displayedMeditationVideos.slice(0, 3);
            
            // Create the bottom row with exactly 3 videos, cycling through if needed
            const bottomRow = [];
            for (let i = 0; i < 3; i++) {
              const index = (nextStartIndex + i) % meditationVideos.length;
              bottomRow.push(meditationVideos[index]);
            }
            
            // Update the displayed videos with both rows
            setDisplayedMeditationVideos([...topRow, ...bottomRow]);
            setMeditationStartIndex(nextStartIndex);
          }
        } catch (error) {
          console.error('Error loading more meditation videos:', error);
        } finally {
          setIsLoadingMeditation(false);
        }
        break;
        
      case VideoCategory.YOGA_FOR_PE:
        setIsLoadingYoga(true);
        try {
          // Toggle expanded state if not expanded yet
          if (!isYogaForPeExpanded) {
            setIsYogaForPeExpanded(true);
            
            // If we don't have enough videos, fetch more first
            if (yogaForPeVideos.length < 6) {
              const newVideos = await getVideosFromCatalog(VideoCategory.YOGA_FOR_PE, yogaForPePage + 1, 6);
              if (newVideos.length > 0) {
                setYogaForPeVideos(prev => [...prev, ...newVideos]);
                setYogaForPePage(yogaForPePage + 1);
              }
            }
            
            // Always ensure we display exactly 6 videos
            const sixVideos = ensureExactlySixVideos(yogaForPeVideos, 0);
            setDisplayedYogaForPeVideos(sixVideos);
            setYogaForPeStartIndex(0); // Track that we're showing from the beginning
          } else {
            // Already expanded, replace the bottom row (last 3 videos)
            
            // Calculate the next 3 videos to show
            const nextStartIndex = (yogaForPeStartIndex + 3) % yogaForPeVideos.length;
            
            // Keep the top row intact
            const topRow = displayedYogaForPeVideos.slice(0, 3);
            
            // Create the bottom row with exactly 3 videos, cycling through if needed
            const bottomRow = [];
            for (let i = 0; i < 3; i++) {
              const index = (nextStartIndex + i) % yogaForPeVideos.length;
              bottomRow.push(yogaForPeVideos[index]);
            }
            
            // Update the displayed videos and start index
            setDisplayedYogaForPeVideos([...topRow, ...bottomRow]);
            setYogaForPeStartIndex(nextStartIndex);
          }
        } finally {
          setIsLoadingYoga(false);
        }
        break;
        
      case VideoCategory.RELAXATION:
        setIsLoadingRelaxation(true);
        try {
          if (!relaxationVideos || relaxationVideos.length === 0) {
            const initialVideos = await getVideosFromCatalog(VideoCategory.RELAXATION, 1, 9);
            if (initialVideos && initialVideos.length > 0) {
              setRelaxationVideos(initialVideos);
              setDisplayedRelaxationVideos(initialVideos.slice(0, 3));
            } else {
              console.error('No relaxation videos available');
              setIsLoadingRelaxation(false);
              return;
            }
          }
          
          // If not expanded yet, show 6 videos
          if (!isRelaxationExpanded) {
            // Always ensure we display exactly 6 videos
            const sixVideos = ensureExactlySixVideos(relaxationVideos, 0);
            setDisplayedRelaxationVideos(sixVideos);
            setIsRelaxationExpanded(true);
            setRelaxationStartIndex(0);
          } else {
            // If already expanded, rotate the bottom row
            const topRow = displayedRelaxationVideos.slice(0, 3);
            
            // Calculate next page start index
            const nextStartIndex = (relaxationStartIndex + 3) % relaxationVideos.length;
            
            // Create the bottom row with exactly 3 videos, cycling through if needed
            const bottomRow = [];
            for (let i = 0; i < 3; i++) {
              const index = (nextStartIndex + i) % relaxationVideos.length;
              bottomRow.push(relaxationVideos[index]);
            }
            
            // Update the displayed videos and start index
            setDisplayedRelaxationVideos([...topRow, ...bottomRow]);
            setRelaxationStartIndex(nextStartIndex);
          }
        } finally {
          setIsLoadingRelaxation(false);
        }
        break;
        
      case VideoCategory.MINDFUL_MOVEMENTS:
        setIsLoadingMindfulMovements(true);
        try {
          // Ensure we have videos to work with
          if (!mindfulMovementsVideos || mindfulMovementsVideos.length === 0) {
            const initialVideos = await getVideosFromCatalog(VideoCategory.MINDFUL_MOVEMENTS, 1, 9);
            if (initialVideos && initialVideos.length > 0) {
              setMindfulMovementsVideos(initialVideos);
              setDisplayedMindfulMovementsVideos(initialVideos.slice(0, 3));
            } else {
              console.error('No mindful movements videos available');
              setIsLoadingMindfulMovements(false);
              return;
            }
          }
          
          // If not expanded yet, show exactly 6 videos
          if (!isMindfulMovementsExpanded) {
            // Always ensure we display exactly 6 videos
            const sixVideos = ensureExactlySixVideos(mindfulMovementsVideos, 0);
            setDisplayedMindfulMovementsVideos(sixVideos);
            setIsMindfulMovementsExpanded(true);
            setMindfulMovementsStartIndex(0);
          } else {
            // If already expanded, rotate the bottom row
            const topRow = displayedMindfulMovementsVideos.slice(0, 3);
            
            // Calculate next page start index
            const nextStartIndex = (mindfulMovementsStartIndex + 3) % mindfulMovementsVideos.length;
            
            // Create the bottom row with exactly 3 videos, cycling through if needed
            const bottomRow = [];
            for (let i = 0; i < 3; i++) {
              const index = (nextStartIndex + i) % mindfulMovementsVideos.length;
              bottomRow.push(mindfulMovementsVideos[index]);
            }
            
            // Update the displayed videos and start index
            setDisplayedMindfulMovementsVideos([...topRow, ...bottomRow]);
            setMindfulMovementsStartIndex(nextStartIndex);
          }
        } catch (error) {
          console.error('Error loading more mindful movements videos:', error);
        } finally {
          setIsLoadingMindfulMovements(false);
        }
        break;
    }
  };
  
  // Handle video click - check access and show premium modal if needed
  const handleVideoClick = async (video: Video) => {
    try {
      console.log('Video click - checking access for:', video.title);
      console.log('Video click - user ID:', user?.id);
      console.log('Video click - user subscription tier:', userSubscriptionTier);
      
      // Properly await the async access check with user ID
      const hasAccess = await hasAccessToVideo(video, user?.id || null, userSubscriptionTier);
      
      console.log(`Access check result for ${video.title}: ${hasAccess ? 'GRANTED' : 'DENIED'}`);
      
      if (hasAccess) {
        setSelectedVideo(video);
        setShowVideoPlayer(true);
      } else {
        setSelectedTier(video.tier);
        setShowPremiumModal(true);
      }
    } catch (error) {
      console.error('Error checking video access:', error);
      // Default to showing premium modal on error for security
      setSelectedTier(video.tier);
      setShowPremiumModal(true);
    }
  };
  
  // Handle filtered video load more
  const handleFilteredLoadMore = () => {
    if (selectedCategory === VideoCategory.MEDITATION) {
      loadMoreVideos(VideoCategory.MEDITATION);
    } else if (selectedCategory === VideoCategory.YOGA_FOR_PE) {
      loadMoreVideos(VideoCategory.YOGA_FOR_PE);
    } else if (selectedCategory === VideoCategory.RELAXATION) {
      loadMoreVideos(VideoCategory.RELAXATION);
    } else if (selectedCategory === VideoCategory.MINDFUL_MOVEMENTS) {
      loadMoreVideos(VideoCategory.MINDFUL_MOVEMENTS);
    }
  };
  
  // Get filtered videos based on search and category
  const getFilteredVideos = () => {
    // Get all videos from catalog for filtering
    const allVideos = getAllVideosFromCatalog();
    
    return allVideos.filter(video => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        video.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === 'all' || 
        video.category === selectedCategory ||
        (selectedCategory === VideoCategory.MINDFUL_MOVEMENTS && video.category === VideoCategory.YOGA_FOR_PE && video.title.includes('Mindful')) ||
        (selectedCategory === 'beginner' && video.level === 'beginner') ||
        (selectedCategory === 'intermediate' && video.level === 'intermediate') ||
        (selectedCategory === 'advanced' && video.level === 'advanced');
      
      return matchesSearch && matchesCategory;
    });
  };
  
  // Get filtered results title
  const getFilteredResultsTitle = () => {
    if (selectedCategory !== 'all') {
      const categoryName = videoSections.find(section => section.id === selectedCategory)?.title || 
                          (selectedCategory === 'beginner' ? 'Beginner' : 
                           selectedCategory === 'intermediate' ? 'Intermediate' : 
                           selectedCategory === 'advanced' ? 'Advanced' : 'Videos');
      return categoryName;
    }
    return 'Search Results';
  };
  
  return (
    <>
      <main className="min-h-screen">
        {/* Hero Banner */}
        <section className="text-white py-12" style={{ background: 'linear-gradient(to right, #1B90A4, #167A8C)' }}>
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Yoga Videos for PE Classes</h1>
            <p className="text-xl max-w-2xl text-white font-medium">Discover our collection of instructional videos designed to help you integrate yoga into your physical education curriculum.</p>
          </div>
        </section>
        
        {/* Search and Filter */}
        <VideoSearchFilter 
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
        />
        
        {/* Video Content */}
        <section className="py-12">
          <div className="container">
            {/* Show filtered videos or category sections */}
            {(selectedCategory !== 'all' || searchQuery !== '') ? (
              <FilteredVideoResults
                title={getFilteredResultsTitle()}
                videos={getFilteredVideos()}
                isLoading={isLoadingMeditation || isLoadingYoga || isLoadingRelaxation}
                userSubscriptionTier={userSubscriptionTier}
                onVideoClick={handleVideoClick}
                onLoadMore={handleFilteredLoadMore}
              />
            ) : (
              // Show all categories in separate sections
              <>
                {/* Yoga for PE Videos */}
                <VideoSection
                  title="Yoga for PE Videos"
                  description="Bring the benefits of yoga to your PE curriculum with these classroom-ready sequences and activities."
                  videos={displayedYogaForPeVideos}
                  isLoading={isLoadingYoga}
                  userSubscriptionTier={userSubscriptionTier}
                  onVideoClick={handleVideoClick}
                  onLoadMore={() => loadMoreVideos(VideoCategory.YOGA_FOR_PE)}
                  isExpanded={isYogaForPeExpanded}
                  sectionName="yoga-for-pe"
                />
                
                {/* Relaxation Videos */}
                <VideoSection
                  title="Relaxation Videos"
                  description="Help students unwind, restore, and find balance with these calming sequences and techniques."
                  videos={displayedRelaxationVideos}
                  isLoading={isLoadingRelaxation}
                  userSubscriptionTier={userSubscriptionTier}
                  onVideoClick={handleVideoClick}
                  onLoadMore={() => loadMoreVideos(VideoCategory.RELAXATION)}
                  isExpanded={isRelaxationExpanded}
                  sectionName="relaxation"
                />
                
                {/* Meditation Videos */}
                <VideoSection
                  title="Meditation Videos"
                  description="Take a breath—you've got this. Mindfulness offers simple, science-backed tools to help you feel calmer, more focused, and grounded."
                  videos={displayedMeditationVideos}
                  isLoading={isLoadingMeditation}
                  userSubscriptionTier={userSubscriptionTier}
                  onVideoClick={handleVideoClick}
                  onLoadMore={() => loadMoreVideos(VideoCategory.MEDITATION)}
                  isExpanded={isMeditationExpanded}
                  sectionName="meditation"
                />
                
                {/* Mindful Movements Videos */}
                <VideoSection
                  title="Mindful Movements Videos"
                  description="Positive, inspirational songs set to yoga and functional strength movements for cardio workouts and SEL discussions."
                  videos={displayedMindfulMovementsVideos || []}
                  isLoading={isLoadingMindfulMovements}
                  userSubscriptionTier={userSubscriptionTier}
                  onVideoClick={handleVideoClick}
                  onLoadMore={() => loadMoreVideos(VideoCategory.MINDFUL_MOVEMENTS)}
                  isExpanded={isMindfulMovementsExpanded}
                  sectionName="mindful-movements"
                />
              </>
            )}
          </div>
        </section>
        
        {/* Subscription CTA */}
        <SubscriptionCTA 
          onSubscribeClick={(tier) => {
            setSelectedTier(tier);
            setShowPremiumModal(true);
          }} 
        />
      </main>
      
      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.vimeoId}
          title={selectedVideo.title}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
      
      {/* Premium Content Modal */}
      {showPremiumModal && (
        <PremiumModal
          selectedTier={selectedTier}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </>
  );
}
