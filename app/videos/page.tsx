'use client'

import { useState } from 'react'
import { FiSearch, FiFilter, FiLock, FiPlay } from 'react-icons/fi'

// Mock data for videos - in a real app, this would come from Supabase
const videoCategories = [
  { id: 'all', name: 'All Videos' },
  { id: 'meditation', name: 'Meditation' },
  { id: 'yogaforpe', name: 'Yoga for PE' },
  { id: 'relaxation', name: 'Relaxation' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
]

// Videos organized by section
const videoSections = [
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Take a breath—you\'ve got this. Mindfulness offers simple, science-backed tools to help you feel calmer, more focused, and grounded.',
    videos: [
      {
        id: 1,
        title: 'Mindful Breathing Techniques',
        description: 'Simple breathing exercises to help students center and focus',
        duration: '8:30',
        level: 'Beginner',
        thumbnail: '/images/video-thumbnail1.jpg',
        vimeoId: '123456789',
        isPremium: false,
        category: 'meditation'
      },
      {
        id: 2,
        title: 'Guided Visualization for Students',
        description: 'Help students develop imagination and focus through guided imagery',
        duration: '12:45',
        level: 'Beginner',
        thumbnail: '/images/video-thumbnail2.jpg',
        vimeoId: '123456790',
        isPremium: true,
        category: 'meditation'
      },
      {
        id: 3,
        title: 'Mindfulness for Test Anxiety',
        description: 'Techniques to help students manage stress before exams',
        duration: '10:20',
        level: 'Intermediate',
        thumbnail: '/images/video-thumbnail3.jpg',
        vimeoId: '123456791',
        isPremium: true,
        category: 'meditation'
      }
    ]
  },
  {
    id: 'yogaforpe',
    title: 'Yoga for PE',
    description: 'Bring the benefits of yoga to your PE curriculum with these classroom-ready sequences and activities.',
    videos: [
      {
        id: 4,
        title: 'Introduction to Yoga for PE',
        description: 'A comprehensive introduction to implementing yoga in physical education classes',
        duration: '15:30',
        level: 'Beginner',
        thumbnail: '/images/video-thumbnail4.jpg',
        vimeoId: '123456792',
        isPremium: false,
        category: 'yogaforpe'
      },
      {
        id: 5,
        title: 'Sun Salutation Series',
        description: 'A simple flow sequence perfect for classroom warm-ups',
        duration: '12:45',
        level: 'Beginner',
        thumbnail: '/images/video-thumbnail5.jpg',
        vimeoId: '123456793',
        isPremium: false,
        category: 'yogaforpe'
      },
      {
        id: 6,
        title: 'Partner Yoga Activities',
        description: 'Fun partner exercises to build trust and cooperation',
        duration: '22:30',
        level: 'Intermediate',
        thumbnail: '/images/video-thumbnail6.jpg',
        vimeoId: '123456794',
        isPremium: true,
        category: 'yogaforpe'
      }
    ]
  },
  {
    id: 'relaxation',
    title: 'Relaxation',
    description: 'Help students unwind, restore, and find balance with these calming sequences and techniques.',
    videos: [
      {
        id: 7,
        title: 'Yoga Cool-Down Routine',
        description: 'End your PE class with this calming cool-down sequence',
        duration: '10:15',
        level: 'All Levels',
        thumbnail: '/images/video-thumbnail7.jpg',
        vimeoId: '123456795',
        isPremium: false,
        category: 'relaxation'
      },
      {
        id: 8,
        title: 'Restorative Yoga for Students',
        description: 'Gentle poses to help students release tension and restore energy',
        duration: '18:20',
        level: 'Beginner',
        thumbnail: '/images/video-thumbnail8.jpg',
        vimeoId: '123456796',
        isPremium: false,
        category: 'relaxation'
      },
      {
        id: 9,
        title: 'Stress Relief Techniques',
        description: 'Quick and effective methods to reduce stress during the school day',
        duration: '15:45',
        level: 'All Levels',
        thumbnail: '/images/video-thumbnail9.jpg',
        vimeoId: '123456797',
        isPremium: true,
        category: 'relaxation'
      }
    ]
  }
]

// Flatten videos for search and filtering
const allVideos = videoSections.flatMap(section => section.videos)

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  // Filter videos based on search and category
  const filteredVideos = allVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         video.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'meditation' && video.category === 'meditation') ||
                           (selectedCategory === 'yogaforpe' && video.category === 'yogaforpe') ||
                           (selectedCategory === 'relaxation' && video.category === 'relaxation') ||
                           video.level.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })
  
  const handleVideoClick = (video: any) => {
    if (video.isPremium) {
      setShowPremiumModal(true)
    } else {
      // Handle free video play - in a real app, redirect to video player
      console.log(`Playing free video: ${video.title}`)
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
              videoSections.map(section => (
                <div key={section.id} className="mb-16">
                  <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{section.title}</h2>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.videos
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
                            {video.isPremium && (
                              <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                <FiLock className="mr-1" size={12} />
                                Premium
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
                              {video.isPremium ? (
                                <span className="text-xs text-yellow-600">Subscription Required</span>
                              ) : (
                                <span className="text-xs text-primary-600">Free</span>
                              )}
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
              ))
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
                        {video.isPremium && (
                          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                            <FiLock className="mr-1" size={12} />
                            Premium
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
                          {video.isPremium ? (
                            <span className="text-xs text-yellow-600">Subscription Required</span>
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
            
            {/* Load More Button */}
            {filteredVideos.length > 0 && (
              <div className="mt-12 text-center">
                <button className="btn btn-secondary">
                  Load More Videos
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Premium Content</h3>
            <p className="mb-6">
              This video is part of our premium content. Subscribe to access our complete library of videos and resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="btn btn-primary flex-1"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans
              </button>
              <button 
                className="btn btn-secondary flex-1"
                onClick={() => setShowPremiumModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
