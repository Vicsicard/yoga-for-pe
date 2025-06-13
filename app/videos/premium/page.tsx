"use client"

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { FiArrowLeft, FiLock, FiSearch, FiFilter, FiPlay } from 'react-icons/fi'

// Video categories for filtering
const videoCategories = [
  { id: 'all', name: 'All Premium Videos' },
  { id: 'meditation', name: 'Meditation' },
  { id: 'yogaforpe', name: 'Yoga for PE' },
  { id: 'relaxation', name: 'Relaxation' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
]

// Premium videos organized by section
const premiumVideoSections = [
  {
    id: 'meditation',
    title: 'Premium Meditation',
    description: 'Advanced mindfulness techniques and guided meditations for PE teachers and students.',
    videos: [
      {
        id: 1,
        title: 'Advanced Mindfulness for PE Teachers',
        description: 'In-depth mindfulness practices specifically designed for physical education professionals',
        duration: '18:30',
        level: 'Intermediate',
        thumbnail: '/images/premium-thumbnail1.jpg',
        vimeoId: '223456789',
        category: 'meditation'
      },
      {
        id: 2,
        title: 'Classroom Meditation Series',
        description: 'A complete 10-part series for implementing meditation in PE classes',
        duration: '45:20',
        level: 'Advanced',
        thumbnail: '/images/premium-thumbnail2.jpg',
        vimeoId: '223456790',
        category: 'meditation'
      },
      {
        id: 3,
        title: 'Mindfulness for Athletic Performance',
        description: 'Techniques to help student athletes improve focus and performance',
        duration: '22:15',
        level: 'Intermediate',
        thumbnail: '/images/premium-thumbnail3.jpg',
        vimeoId: '223456791',
        category: 'meditation'
      }
    ]
  },
  {
    id: 'yogaforpe',
    title: 'Premium Yoga for PE',
    description: 'Advanced yoga sequences and comprehensive curriculum materials for physical education.',
    videos: [
      {
        id: 4,
        title: 'Complete PE Yoga Curriculum',
        description: 'A full semester curriculum with lesson plans and assessment tools',
        duration: '120:00',
        level: 'Advanced',
        thumbnail: '/images/premium-thumbnail4.jpg',
        vimeoId: '223456792',
        category: 'yogaforpe'
      },
      {
        id: 5,
        title: 'Advanced Yoga Sequences for PE',
        description: 'Complex sequences designed for older students and advanced practitioners',
        duration: '35:45',
        level: 'Advanced',
        thumbnail: '/images/premium-thumbnail5.jpg',
        vimeoId: '223456793',
        category: 'yogaforpe'
      },
      {
        id: 6,
        title: 'Yoga for Sports Performance',
        description: 'Specialized yoga techniques to enhance athletic performance in various sports',
        duration: '42:30',
        level: 'Intermediate',
        thumbnail: '/images/premium-thumbnail6.jpg',
        vimeoId: '223456794',
        category: 'yogaforpe'
      }
    ]
  },
  {
    id: 'relaxation',
    title: 'Premium Relaxation',
    description: 'Advanced relaxation techniques and restorative practices for stress management and recovery.',
    videos: [
      {
        id: 7,
        title: 'Deep Relaxation Practices',
        description: 'Advanced techniques for helping students achieve deep relaxation states',
        duration: '28:15',
        level: 'Intermediate',
        thumbnail: '/images/premium-thumbnail7.jpg',
        vimeoId: '223456795',
        category: 'relaxation'
      },
      {
        id: 8,
        title: 'Restorative Yoga Master Class',
        description: 'Comprehensive guide to restorative yoga poses and practices for PE settings',
        duration: '55:20',
        level: 'Advanced',
        thumbnail: '/images/premium-thumbnail8.jpg',
        vimeoId: '223456796',
        category: 'relaxation'
      },
      {
        id: 9,
        title: 'Stress Management for Academic Performance',
        description: 'Techniques to help students manage stress during high-pressure academic periods',
        duration: '32:45',
        level: 'Intermediate',
        thumbnail: '/images/premium-thumbnail9.jpg',
        vimeoId: '223456797',
        category: 'relaxation'
      }
    ]
  }
]

// Flatten videos for search and filtering
const allPremiumVideos = premiumVideoSections.flatMap(section => section.videos)

export default function PremiumVideosPage() {
  const { user, isLoaded } = useUser()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter videos based on search and category
  const filteredVideos = allPremiumVideos.filter(video => {
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
    // Handle premium video play - in a real app, redirect to video player
    console.log(`Playing premium video: ${video.title}`)
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }
  
  // If user is not authenticated, show a message
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <FiLock className="mx-auto text-5xl text-primary-600 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Premium Content</h1>
          <p className="text-lg mb-8">Please sign in to access premium videos and resources.</p>
          <Link href="/videos" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
            <FiArrowLeft className="mr-2" />
            Back to All Videos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-primary-800 to-primary-900 text-white py-12">
          <div className="container">
            <div className="flex items-center mb-6">
              <Link href="/videos" className="inline-flex items-center text-white hover:text-primary-200">
                <FiArrowLeft className="mr-2" />
                Back to All Videos
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Premium Videos</h1>
            <p className="text-xl max-w-2xl text-white font-medium">
              Access our exclusive collection of premium yoga videos designed specifically for PE teachers.
              These videos provide in-depth instruction and advanced techniques.
            </p>
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
                  placeholder="Search premium videos..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              {/* Filter Dropdown */}
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
              premiumVideoSections.map(section => (
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
                              <span className="text-lg font-medium">Premium Video</span>
                            </div>
                            
                            {/* Play button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                                <FiPlay size={24} />
                              </div>
                            </div>
                            
                            {/* Duration */}
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                              {video.duration}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white shadow-md">
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">{video.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{video.level}</span>
                              <span className="text-xs text-yellow-600">Premium</span>
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
                    {videoCategories.find(cat => cat.id === selectedCategory)?.name || 'Premium Videos'}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map(video => (
                    <div key={video.id} className="card group cursor-pointer" onClick={() => handleVideoClick(video)}>
                      <div className="relative aspect-video overflow-hidden bg-gray-300">
                        {/* This would be the video thumbnail */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-800/20 group-hover:from-primary-500/30 group-hover:to-primary-800/30 transition-all" />
                        <div className="flex items-center justify-center w-full h-full text-white">
                          <span className="text-lg font-medium">Premium Video</span>
                        </div>
                        
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center transition-transform group-hover:scale-110">
                            <FiPlay size={24} />
                          </div>
                        </div>
                        
                        {/* Duration */}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white shadow-md">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary-600 transition-colors">{video.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{video.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{video.level}</span>
                          <span className="text-xs text-yellow-600">Premium</span>
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
          </div>
        </section>
      </main>
    </>
  )
}
