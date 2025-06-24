'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiLock, FiPlay, FiChevronRight, FiRefreshCw } from 'react-icons/fi'
import { VideoCategory, SubscriptionTier, Video, hasAccessToVideo, subscriptionTierDetails } from '../../lib/vimeo-browser'
import { getVideosFromCatalog, getAllVideosFromCatalog } from '../../lib/video-catalog'

// Video filter categories
const videoCategories = [
  { id: 'all', name: 'All Videos' },
  { id: VideoCategory.MEDITATION, name: 'Meditation' },
  { id: VideoCategory.YOGA_FOR_PE, name: 'Yoga for PE' },
  { id: VideoCategory.RELAXATION, name: 'Relaxation' },
  { id: VideoCategory.MINDFUL_MOVEMENTS, name: 'Mindful Movements' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
]

// Define section type
type VideoSection = {
  id: VideoCategory;
  title: string;
  description: string;
};

// Section definitions
const videoSections: VideoSection[] = [
  {
    id: VideoCategory.MEDITATION,
    title: 'Meditation',
    description: 'Take a breath—you\'ve got this. Mindfulness offers simple, science-backed tools to help you feel calmer, more focused, and grounded.',
  },
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
    id: VideoCategory.MINDFUL_MOVEMENTS,
    title: 'Mindful Movements',
    description: 'Positive, inspirational songs set to yoga and functional strength movements for cardio workouts and SEL discussions.',
  }
]

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null)
  
  // State for videos in each category with pagination
  const [meditationVideos, setMeditationVideos] = useState<Video[]>([])
  const [yogaForPeVideos, setYogaForPeVideos] = useState<Video[]>([])
  const [relaxationVideos, setRelaxationVideos] = useState<Video[]>([])
  
  // State for displayed videos in each category (3 at a time)
  const [displayedMeditationVideos, setDisplayedMeditationVideos] = useState<Video[]>([])
  const [displayedYogaForPeVideos, setDisplayedYogaForPeVideos] = useState<Video[]>([])
  const [displayedRelaxationVideos, setDisplayedRelaxationVideos] = useState<Video[]>([])
  
  // State for current display index in each category
  const [meditationStartIndex, setMeditationStartIndex] = useState(0)
  const [yogaForPeStartIndex, setYogaForPeStartIndex] = useState(0)
  const [relaxationStartIndex, setRelaxationStartIndex] = useState(0)
  
  // State for loading status in each category
  const [isLoadingMeditation, setIsLoadingMeditation] = useState(false)
  const [isLoadingYoga, setIsLoadingYoga] = useState(false)
  const [isLoadingRelaxation, setIsLoadingRelaxation] = useState(false)
  
  // State for pagination in each category
  const [meditationPage, setMeditationPage] = useState(1)
  const [yogaForPePage, setYogaForPePage] = useState(1)
  const [relaxationPage, setRelaxationPage] = useState(1)
  
  // For demo purposes, we'll use Bronze tier (free) as the default user tier
  // In a real app, this would come from authentication
  const [userSubscriptionTier, setUserSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.BRONZE)
  
  // Load initial videos for each category
  useEffect(() => {
    const fetchInitialVideos = async () => {
      setIsLoadingMeditation(true);
      setIsLoadingYoga(true);
      setIsLoadingRelaxation(true);
      
      try {
        // Fetch videos from our catalog data
        const meditationData = await getVideosFromCatalog(VideoCategory.MEDITATION, 1, 9);
        const yogaForPeData = await getVideosFromCatalog(VideoCategory.YOGA_FOR_PE, 1, 9);
        const relaxationData = await getVideosFromCatalog(VideoCategory.RELAXATION, 1, 9);
        
        setMeditationVideos(meditationData);
        setYogaForPeVideos(yogaForPeData);
        setRelaxationVideos(relaxationData);
        
        // Set initial displayed videos (first 3 of each category)
        setDisplayedMeditationVideos(meditationData.slice(0, 3));
        setDisplayedYogaForPeVideos(yogaForPeData.slice(0, 3));
        setDisplayedRelaxationVideos(relaxationData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoadingMeditation(false);
        setIsLoadingYoga(false);
        setIsLoadingRelaxation(false);
      }
    };
    
    fetchInitialVideos();
  }, []);
  
  // Function to load more videos for a specific category
  const loadMoreVideos = async (category: VideoCategory) => {
    switch (category) {
      case VideoCategory.MEDITATION:
        setIsLoadingMeditation(true);
        try {
          // If we've shown all videos, fetch more
          if (meditationStartIndex + 3 >= meditationVideos.length) {
            const newMeditationVideos = await getVideosFromCatalog(VideoCategory.MEDITATION, meditationPage + 1, 6);
            if (newMeditationVideos.length > 0) {
              setMeditationVideos(prev => [...prev, ...newMeditationVideos]);
              setMeditationPage(meditationPage + 1);
            }
          }
          
          // Calculate next start index with wraparound
          const nextMeditationIndex = (meditationStartIndex + 3) % meditationVideos.length;
          setMeditationStartIndex(nextMeditationIndex);
          
          const endIndex = Math.min(nextMeditationIndex + 3, meditationVideos.length);
          let nextVideos = meditationVideos.slice(nextMeditationIndex, endIndex);
          
          // If not enough videos, wrap around
          if (nextVideos.length < 3 && meditationVideos.length > 3) {
            const remaining = 3 - nextVideos.length;
            nextVideos = [...nextVideos, ...meditationVideos.slice(0, remaining)];
          }
          
          setDisplayedMeditationVideos(nextVideos);
        } catch (error) {
          console.error('Error loading more meditation videos:', error);
        } finally {
          setIsLoadingMeditation(false);
        }
        break;
        
      case VideoCategory.YOGA_FOR_PE:
        setIsLoadingYoga(true);
        try {
          // If we've shown all videos, fetch more
          if (yogaForPeStartIndex + 3 >= yogaForPeVideos.length) {
            const newVideos = await getVideosFromCatalog(VideoCategory.YOGA_FOR_PE, yogaForPePage + 1, 6);
            if (newVideos.length > 0) {
              setYogaForPeVideos(prev => [...prev, ...newVideos]);
              setYogaForPePage(yogaForPePage + 1);
            }
          }
          
          // Calculate next start index with wraparound
          const nextYogaIndex = (yogaForPeStartIndex + 3) % yogaForPeVideos.length;
          setYogaForPeStartIndex(nextYogaIndex);
          
          const endIndex = Math.min(nextYogaIndex + 3, yogaForPeVideos.length);
          let nextVideos = yogaForPeVideos.slice(nextYogaIndex, endIndex);
          
          // If not enough videos, wrap around
          if (nextVideos.length < 3 && yogaForPeVideos.length > 3) {
            const remaining = 3 - nextVideos.length;
            nextVideos = [...nextVideos, ...yogaForPeVideos.slice(0, remaining)];
          }
          
          setDisplayedYogaForPeVideos(nextVideos);
        } catch (error) {
          console.error('Error loading more yoga videos:', error);
        } finally {
          setIsLoadingYoga(false);
        }
        break;
        
      case VideoCategory.RELAXATION:
        setIsLoadingRelaxation(true);
        try {
          // If we've shown all videos, fetch more
          if (relaxationStartIndex + 3 >= relaxationVideos.length) {
            const newVideos = await getVideosFromCatalog(VideoCategory.RELAXATION, relaxationPage + 1, 6);
            if (newVideos.length > 0) {
              setRelaxationVideos(prev => [...prev, ...newVideos]);
              setRelaxationPage(relaxationPage + 1);
            }
          }
          
          // Calculate next start index with wraparound
          const nextRelaxIndex = (relaxationStartIndex + 3) % relaxationVideos.length;
          setRelaxationStartIndex(nextRelaxIndex);
          
          const endIndex = Math.min(nextRelaxIndex + 3, relaxationVideos.length);
          let nextVideos = relaxationVideos.slice(nextRelaxIndex, endIndex);
          
          // If not enough videos, wrap around
          if (nextVideos.length < 3 && relaxationVideos.length > 3) {
            const remaining = 3 - nextVideos.length;
            nextVideos = [...nextVideos, ...relaxationVideos.slice(0, remaining)];
          }
          
          setDisplayedRelaxationVideos(nextVideos);
        } catch (error) {
          console.error('Error loading more relaxation videos:', error);
        } finally {
          setIsLoadingRelaxation(false);
        }
        break;
    }
  };
  
  // Handle video click - check access and show premium modal if needed
  const handleVideoClick = (video: Video) => {
    if (hasAccessToVideo(video, userSubscriptionTier)) {
      // User has access - play video
      // In a real app, redirect to video player or open modal with player
      console.log(`Playing video: ${video.title}`);
    } else {
      // User doesn't have access - show premium modal
      setSelectedTier(video.tier);
      setShowPremiumModal(true);
    }
  };
  
  return (
    <>
      <main className="min-h-screen">
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-12">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Yoga Videos for PE Classes</h1>
            <p className="text-xl max-w-2xl text-white font-medium">Discover our collection of instructional videos designed to help you integrate yoga into your physical education curriculum.</p>
          </div>
        </section>
        
        {/* Search and Filter */}
        <section className="bg-white py-6 border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-grow max-w-md">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              {/* Filter Dropdown */}
              <div className="relative">
                <div className="flex items-center border rounded-lg px-4 py-2 cursor-pointer">
                  <FiFilter className="mr-2" />
                  <select 
                    className="bg-transparent appearance-none focus:outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {videoCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Video Content */}
        <section className="py-12">
          <div className="container">
            {/* Filter videos by search and category */}
            {(() => {
              // Get all videos from catalog for filtering
              const allVideos = getAllVideosFromCatalog();
              
              const filteredVideos = allVideos.filter(video => {
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
              
              // Show filtered videos or category sections
              if (selectedCategory !== 'all' || searchQuery !== '') {
                return (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">
                      {selectedCategory !== 'all' 
                        ? videoCategories.find(c => c.id === selectedCategory)?.name 
                        : 'Search Results'}
                    </h2>
                    
                    {filteredVideos.length === 0 ? (
                      <p className="text-gray-500">No videos found matching your criteria.</p>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredVideos.map(video => (
                            <div 
                              key={video.id} 
                              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => handleVideoClick(video)}
                            >
                              {/* Video thumbnail with play button overlay */}
                              <div className="relative aspect-video bg-gray-200">
                                {/* Thumbnail placeholder - in a real app, use video.thumbnail */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full bg-primary-500/80 flex items-center justify-center">
                                    {video.tier !== SubscriptionTier.BRONZE && 
                                     !hasAccessToVideo(video, userSubscriptionTier) ? (
                                      <FiLock className="text-white text-2xl" />
                                    ) : (
                                      <FiPlay className="text-white text-2xl" />
                                    )}
                                  </div>
                                </div>
                                
                                {/* Subscription tier badge */}
                                <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium" 
                                  style={{
                                    backgroundColor: video.tier === SubscriptionTier.GOLD 
                                      ? 'rgba(234, 179, 8, 0.9)' 
                                      : video.tier === SubscriptionTier.SILVER 
                                        ? 'rgba(148, 163, 184, 0.9)' 
                                        : 'rgba(59, 130, 246, 0.9)',
                                    color: 'white'
                                  }}
                                >
                                  {video.tier === SubscriptionTier.GOLD 
                                    ? 'Gold' 
                                    : video.tier === SubscriptionTier.SILVER 
                                      ? 'Silver' 
                                      : 'Free'}
                                </div>
                                
                                {/* Duration badge */}
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-xs">
                                  {video.duration}
                                </div>
                              </div>
                              
                              <div className="p-4">
                                <h3 className="font-bold mb-1">{video.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{video.level}</span>
                                  <span className="text-xs text-gray-500">
                                    {video.tier === SubscriptionTier.BRONZE 
                                      ? 'Free' 
                                      : video.tier === SubscriptionTier.SILVER 
                                        ? 'Silver ($7.99)' 
                                        : 'Gold ($9.99)'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Load more button for filtered results */}
                        <div className="mt-8 text-center">
                          <button 
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
                            onClick={() => {
                              // Handle load more videos for filtered results
                              if (selectedCategory === VideoCategory.MEDITATION) {
                                loadMoreVideos(VideoCategory.MEDITATION);
                              } else if (selectedCategory === VideoCategory.YOGA_FOR_PE) {
                                loadMoreVideos(VideoCategory.YOGA_FOR_PE);
                              } else if (selectedCategory === VideoCategory.RELAXATION) {
                                loadMoreVideos(VideoCategory.RELAXATION);
                              }
                            }}
                            disabled={isLoadingMeditation || isLoadingYoga || isLoadingRelaxation}
                          >
                            {isLoadingMeditation || isLoadingYoga || isLoadingRelaxation ? (
                              <span>Loading...</span>
                            ) : (
                              <>
                                <span>Show Next Videos</span>
                                <FiRefreshCw className="ml-2" />
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              } else {
                // Show all three categories in separate sections
                return videoSections.map(section => {
                  let sectionVideos: Video[] = [];
                  let isLoading = false;
                  
                  switch(section.id) {
                    case VideoCategory.MEDITATION:
                      sectionVideos = displayedMeditationVideos;
                      isLoading = isLoadingMeditation;
                      break;
                    case VideoCategory.YOGA_FOR_PE:
                      sectionVideos = displayedYogaForPeVideos;
                      isLoading = isLoadingYoga;
                      break;
                    case VideoCategory.RELAXATION:
                      sectionVideos = displayedRelaxationVideos;
                      isLoading = isLoadingRelaxation;
                      break;
                  }
                  
                  return (
                    <div key={section.id} className="mb-16">
                      <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                      <p className="text-gray-600 mb-6">{section.description}</p>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sectionVideos.map(video => (
                          <div 
                            key={video.id} 
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => handleVideoClick(video)}
                          >
                            {/* Video thumbnail with play button overlay */}
                            <div className="relative aspect-video bg-gray-200">
                              {/* Thumbnail placeholder - in a real app, use video.thumbnail */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary-500/80 flex items-center justify-center">
                                  {video.tier !== SubscriptionTier.BRONZE && 
                                   !hasAccessToVideo(video, userSubscriptionTier) ? (
                                    <FiLock className="text-white text-2xl" />
                                  ) : (
                                    <FiPlay className="text-white text-2xl" />
                                  )}
                                </div>
                              </div>
                              
                              {/* Subscription tier badge */}
                              <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium" 
                                style={{
                                  backgroundColor: video.tier === SubscriptionTier.GOLD 
                                    ? 'rgba(234, 179, 8, 0.9)' 
                                    : video.tier === SubscriptionTier.SILVER 
                                      ? 'rgba(148, 163, 184, 0.9)' 
                                      : 'rgba(59, 130, 246, 0.9)',
                                  color: 'white'
                                }}
                              >
                                {video.tier === SubscriptionTier.GOLD 
                                  ? 'Gold' 
                                  : video.tier === SubscriptionTier.SILVER 
                                    ? 'Silver' 
                                    : 'Bronze'}
                              </div>
                              
                              {/* Duration badge */}
                              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded text-xs">
                                {video.duration}
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-bold mb-1">{video.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{video.level}</span>
                                <span className="text-xs text-gray-500">
                                  {video.tier === SubscriptionTier.BRONZE 
                                    ? 'Bronze (Free)' 
                                    : video.tier === SubscriptionTier.SILVER 
                                      ? 'Silver ($7.99)' 
                                      : 'Gold ($9.99)'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Load more button for each section */}
                      <div className="mt-6 text-center">
                        <button 
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
                          onClick={() => loadMoreVideos(section.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span>Loading...</span>
                          ) : (
                            <>
                              <span>Show Next Videos</span>
                              <FiRefreshCw className="ml-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                });
              }
            })()}
          </div>
        </section>
        
        {/* Subscription CTA */}
        <section className="bg-primary-50 py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Unlock Premium Content</h2>
              <p className="text-lg text-gray-700 mb-8">
                Subscribe to access our complete library of premium videos, curriculum materials, and exclusive resources for yoga in physical education.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // Default to Silver tier when opening from CTA
                    setSelectedTier(SubscriptionTier.SILVER);
                    setShowPremiumModal(true);
                  }}
                >
                  View Subscription Plans
                </button>
                <button className="btn btn-secondary">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Premium Content Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">
              {selectedTier !== null && subscriptionTierDetails[selectedTier].name} Subscription Required
            </h3>
            <p className="mb-6">
              {selectedTier !== null &&
                `This video requires a ${subscriptionTierDetails[selectedTier].name} subscription ($${subscriptionTierDetails[selectedTier].price.toFixed(2)}/month). ${subscriptionTierDetails[selectedTier].description}.`
              }
            </p>
            
            <div className="mb-6">
              <h4 className="font-bold mb-2">Subscription Options:</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium">{subscriptionTierDetails[SubscriptionTier.SILVER].name} Subscription</span>
                    <p className="text-sm text-gray-600">{subscriptionTierDetails[SubscriptionTier.SILVER].description}</p>
                  </div>
                  <span className="font-bold">${subscriptionTierDetails[SubscriptionTier.SILVER].price.toFixed(2)}/mo</span>
                </div>
                <div className="p-3 border rounded-lg flex justify-between items-center bg-yellow-50">
                  <div>
                    <span className="font-medium">{subscriptionTierDetails[SubscriptionTier.GOLD].name} Subscription</span>
                    <p className="text-sm text-gray-600">{subscriptionTierDetails[SubscriptionTier.GOLD].description}</p>
                  </div>
                  <span className="font-bold">${subscriptionTierDetails[SubscriptionTier.GOLD].price.toFixed(2)}/mo</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={() => {
                  // Redirect to Vimeo OTT subscription page
                  // In a real implementation, this would use the actual Vimeo OTT subscription URL
                  const tier = selectedTier === SubscriptionTier.SILVER ? 'silver' : 'gold';
                  const subscriptionUrl = `https://vimeo.com/ott/yogaforpe/subscribe/${tier}`;
                  
                  // Open in a new tab
                  window.open(subscriptionUrl, '_blank');
                  setShowPremiumModal(false);
                }}
              >
                Subscribe Now
              </button>
              
              <button
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowPremiumModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
