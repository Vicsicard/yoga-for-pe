'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiLock, FiPlay } from 'react-icons/fi'
import { VideoCategory, SubscriptionTier, Video, getVideosByCategory, hasAccessToVideo } from '../../lib/vimeo-browser'

// Video filter categories
const videoCategories = [
  { id: 'all', name: 'All Videos' },
  { id: VideoCategory.MEDITATION, name: 'Meditation' },
  { id: VideoCategory.YOGA_FOR_PE, name: 'Yoga for PE' },
  { id: VideoCategory.RELAXATION, name: 'Relaxation' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
]

// Section definitions
const videoSections = [
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
  
  // State for loading status in each category
  const [isLoadingMeditation, setIsLoadingMeditation] = useState(false)
  const [isLoadingYoga, setIsLoadingYoga] = useState(false)
  const [isLoadingRelaxation, setIsLoadingRelaxation] = useState(false)
  
  // State for pagination in each category
  const [meditationPage, setMeditationPage] = useState(1)
  const [yogaForPePage, setYogaForPePage] = useState(1)
  const [relaxationPage, setRelaxationPage] = useState(1)
  
  // State for loading indicators
  const [loadingMeditation, setLoadingMeditation] = useState(false)
  const [loadingYogaForPe, setLoadingYogaForPe] = useState(false)
  const [loadingRelaxation, setLoadingRelaxation] = useState(false)
  
  // For demo purposes, we'll use Bronze tier (free) as the default user tier
  // In a real app, this would come from authentication
  const [userSubscriptionTier, setUserSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.BRONZE)
  
  // Load initial videos for each category
  useEffect(() => {
    const fetchInitialVideos = async () => {
      setLoadingMeditation(true);
      setLoadingYogaForPe(true);
      setLoadingRelaxation(true);
      
      try {
        const meditationData = await getVideosByCategory(VideoCategory.MEDITATION, 1, 3);
        const yogaForPeData = await getVideosByCategory(VideoCategory.YOGA_FOR_PE, 1, 3);
        const relaxationData = await getVideosByCategory(VideoCategory.RELAXATION, 1, 3);
        
        setMeditationVideos(meditationData);
        setYogaForPeVideos(yogaForPeData);
        setRelaxationVideos(relaxationData);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoadingMeditation(false);
        setLoadingYogaForPe(false);
        setLoadingRelaxation(false);
      }
    };
    
    fetchInitialVideos();
  }, []);
  
  // Function to load more videos for a specific category
  const loadMoreVideos = async (category: VideoCategory) => {
    switch (category) {
      case VideoCategory.MEDITATION:
        setIsLoadingMeditation(true)
        try {
          const newMeditationVideos = await getVideosByCategory(VideoCategory.MEDITATION, meditationPage + 1)
          setMeditationVideos(prev => [...prev, ...newMeditationVideos])
          setMeditationPage(meditationPage + 1)
        } catch (error) {
          console.error('Error loading more meditation videos:', error);
        } finally {
          setIsLoadingMeditation(false)
        }
        break
        
      case VideoCategory.YOGA_FOR_PE:
        setLoadingYogaForPe(true);
        try {
          const nextPage = yogaForPePage + 1;
          const newVideos = await getVideosByCategory(VideoCategory.YOGA_FOR_PE, nextPage, 3);
          if (newVideos.length > 0) {
            setYogaForPeVideos([...yogaForPeVideos, ...newVideos]);
            setYogaForPePage(nextPage);
          }
        } catch (error) {
          console.error('Error loading more yoga videos:', error);
        } finally {
          setLoadingYogaForPe(false);
        }
        break;
        
      case VideoCategory.RELAXATION:
        setLoadingRelaxation(true);
        try {
          const nextPage = relaxationPage + 1;
          const newVideos = await getVideosByCategory(VideoCategory.RELAXATION, nextPage, 3);
          if (newVideos.length > 0) {
            setRelaxationVideos([...relaxationVideos, ...newVideos]);
            setRelaxationPage(nextPage);
          }
        } catch (error) {
          console.error('Error loading more relaxation videos:', error);
        } finally {
          setLoadingRelaxation(false);
        }
        break;
    }
  };
  
  // Get all videos for filtering
  const allVideos = [...meditationVideos, ...yogaForPeVideos, ...relaxationVideos];
  
  // Filter videos based on search and category
  const filteredVideos = allVideos.filter(video => {
    // Filter by search query
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === 'all' || 
                            video.category === selectedCategory ||
                            video.level.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  })
  
  const handleVideoClick = (video: Video) => {
    // Check if user has access to this video based on their subscription tier
    const hasAccess = video.tier === SubscriptionTier.BRONZE || 
                     (userSubscriptionTier === SubscriptionTier.SILVER && 
                      [SubscriptionTier.BRONZE, SubscriptionTier.SILVER].includes(video.tier)) ||
                     userSubscriptionTier === SubscriptionTier.GOLD;
    
    if (!hasAccess) {
      // Show premium modal if user doesn't have access
      setSelectedTier(video.tier);
      setShowPremiumModal(true);
    } else {
      // Handle video play - in a real app, redirect to video player
      console.log(`Playing video: ${video.title}`);
    }
  }
  
  return (
    <>
      <main>
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
              <div className="relative flex-grow max-w-xl">
                <input
                  type="text"
                  placeholder="Search videos..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Filter Dropdown - simplified for this example */}
              <div className="flex items-center">
                <FiFilter className="mr-2 text-gray-500" />
                <span className="mr-2 text-gray-700">Filter:</span>
                <select 
                  className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        </section>
        
        {/* Video Sections */}
        <section className="bg-gray-50 py-12">
          <div className="container">
            {selectedCategory === 'all' ? (
              // Display all three sections when no specific category is selected
              videoSections.map(section => {
                // Get the appropriate videos for this section
                let sectionVideos: Video[] = [];
                
                switch(section.id) {
                  case VideoCategory.MEDITATION:
                    sectionVideos = meditationVideos;
                    break;
                  case VideoCategory.YOGA_FOR_PE:
                    sectionVideos = yogaForPeVideos;
                    break;
                  case VideoCategory.RELAXATION:
                    sectionVideos = relaxationVideos;
                    break;
                }
                
                return (
                  <div key={section.id} className="mb-16">
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2">{section.title}</h2>
                      <p className="text-gray-600">{section.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sectionVideos
                        .filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        video.description.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(video => (
                          <div key={video.id} className="card group cursor-pointer" onClick={() => handleVideoClick(video)}>
                            <div className="relative aspect-video overflow-hidden bg-gray-300">
                              {/* This would be the video thumbnail */}
                              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-800/20 group-hover:from-primary-500/30 group-hover:to-primary-800/30 transition-all" />
                              <div className="flex items-center justify-center w-full h-full text-white">
                                <span className="text-lg font-medium">Video Thumbnail</span>
                              </div>
                              
                              {/* Play button */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                                  <FiPlay size={24} />
                                </div>
                              </div>
                              
                              {/* Premium badge */}
                              {video.tier !== SubscriptionTier.BRONZE && (
                                <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                  <FiLock className="mr-1" size={12} />
                                  {video.tier === SubscriptionTier.SILVER ? 'Silver' : 'Gold'}
                                </div>
                              )}
                              
                              {/* Duration */}
                              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                {video.duration}
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">{video.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{video.level}</span>
                                {video.tier !== SubscriptionTier.BRONZE ? (
                                  <span className="text-xs text-yellow-600">{video.tier === SubscriptionTier.SILVER ? 'Silver' : 'Gold'} Subscription</span>
                                ) : (
                                  <span className="text-xs text-primary-600">Free</span>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                    
                    {/* Load More button for this section */}
                    {((section.id === VideoCategory.MEDITATION && meditationVideos.length >= meditationPage * 3) ||
                      (section.id === VideoCategory.YOGA_FOR_PE && yogaForPeVideos.length >= yogaForPePage * 3) ||
                      (section.id === VideoCategory.RELAXATION && relaxationVideos.length >= relaxationPage * 3)) && (
                      <div className="mt-6 text-center">
                        <button 
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          onClick={() => loadMoreVideos(section.id)}
                          disabled={
                            (section.id === VideoCategory.MEDITATION && loadingMeditation) ||
                            (section.id === VideoCategory.YOGA_FOR_PE && loadingYogaForPe) ||
                            (section.id === VideoCategory.RELAXATION && loadingRelaxation)
                          }
                        >
                          {(section.id === VideoCategory.MEDITATION && loadingMeditation) ||
                           (section.id === VideoCategory.YOGA_FOR_PE && loadingYogaForPe) ||
                           (section.id === VideoCategory.RELAXATION && loadingRelaxation)
                            ? 'Loading...'
                            : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : filteredVideos.length > 0 ? (
              // Display filtered videos when a category is selected
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {videoCategories.find(cat => cat.id === selectedCategory)?.name || 'Videos'}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map(video => (
                    <div key={video.id} className="card group cursor-pointer" onClick={() => handleVideoClick(video)}>
                      <div className="relative aspect-video overflow-hidden bg-gray-300">
                        {/* This would be the video thumbnail */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-800/20 group-hover:from-primary-500/30 group-hover:to-primary-800/30 transition-all" />
                        <div className="flex items-center justify-center w-full h-full text-white">
                          <span className="text-lg font-medium">Video Thumbnail</span>
                        </div>
                        
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                            <FiPlay size={24} />
                          </div>
                        </div>
                        
                        {/* Premium badge */}
                        {video.tier !== SubscriptionTier.BRONZE && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <FiLock className="mr-1" size={12} />
                            {video.tier === SubscriptionTier.SILVER ? 'Silver' : 'Gold'}
                          </div>
                        )}
                        
                        {/* Duration */}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">{video.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{video.level}</span>
                          {video.tier !== SubscriptionTier.BRONZE ? (
                            <span className="text-xs text-yellow-600">{video.tier === SubscriptionTier.SILVER ? 'Silver' : 'Gold'} Subscription</span>
                          ) : (
                            <span className="text-xs text-primary-600">Free</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No videos found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
            
            {/* Load More Button for filtered results */}
            {filteredVideos.length > 0 && selectedCategory !== 'all' && (
              <div className="mt-12 text-center">
                <button 
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => {
                    // Determine which category to load more videos for
                    if (selectedCategory === VideoCategory.MEDITATION) {
                      loadMoreVideos(VideoCategory.MEDITATION);
                    } else if (selectedCategory === VideoCategory.YOGA_FOR_PE) {
                      loadMoreVideos(VideoCategory.YOGA_FOR_PE);
                    } else if (selectedCategory === VideoCategory.RELAXATION) {
                      loadMoreVideos(VideoCategory.RELAXATION);
                    }
                  }}
                  disabled={loadingMeditation || loadingYogaForPe || loadingRelaxation}
                >
                  {loadingMeditation || loadingYogaForPe || loadingRelaxation ? 'Loading...' : 'Load More Videos'}
                </button>
              </div>
            )}
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
                <button className="btn btn-primary">
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
              {selectedTier === SubscriptionTier.SILVER ? 'Silver' : 'Gold'} Subscription Required
            </h3>
            <p className="mb-6">
              {selectedTier === SubscriptionTier.SILVER
                ? 'This video requires a Silver subscription ($7.99/month). Upgrade to access this and other Silver content.'
                : 'This video requires a Gold subscription ($9.99/month). Upgrade to access all premium content including Gold videos.'}
            </p>
            
            <div className="mb-6">
              <h4 className="font-bold mb-2">Subscription Options:</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-medium">Silver Subscription</span>
                    <p className="text-sm text-gray-600">Access to Bronze and Silver content</p>
                  </div>
                  <span className="font-bold">$7.99/mo</span>
                </div>
                <div className="p-3 border rounded-lg flex justify-between items-center bg-yellow-50">
                  <div>
                    <span className="font-medium">Gold Subscription</span>
                    <p className="text-sm text-gray-600">Access to all content</p>
                  </div>
                  <span className="font-bold">$9.99/mo</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={() => {
                  // In a real app, redirect to subscription page with Vimeo OTT
                  console.log('Redirecting to Vimeo OTT subscription page');
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
  )
}
