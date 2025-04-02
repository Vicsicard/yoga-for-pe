'use client'

import { useState } from 'react'
import { FiPlay, FiLock } from 'react-icons/fi'

const videos = [
  {
    id: 1,
    title: 'Partner Yoga Basics',
    description: 'Introduction to safe and fun partner yoga activities',
    duration: '16:30',
    thumbnail: '/images/partner-1.jpg',
    vimeoId: '123456841',
    isPremium: false
  },
  {
    id: 2,
    title: 'Trust Building Exercises',
    description: 'Partner poses that develop trust and communication',
    duration: '18:45',
    thumbnail: '/images/partner-2.jpg',
    vimeoId: '123456842',
    isPremium: false
  },
  {
    id: 3,
    title: 'Partner Balance Challenges',
    description: 'Fun balance poses to practice with a partner',
    duration: '20:20',
    thumbnail: '/images/partner-3.jpg',
    vimeoId: '123456843',
    isPremium: true
  },
  {
    id: 4,
    title: 'Group Partner Flows',
    description: 'Flowing sequences designed for partner work',
    duration: '22:15',
    thumbnail: '/images/partner-4.jpg',
    vimeoId: '123456844',
    isPremium: false
  },
  {
    id: 5,
    title: 'Partner Stretching',
    description: 'Safe and effective partner-assisted stretching techniques',
    duration: '19:30',
    thumbnail: '/images/partner-5.jpg',
    vimeoId: '123456845',
    isPremium: true
  },
  {
    id: 6,
    title: 'Partner Yoga Games',
    description: 'Engaging games and activities for pairs',
    duration: '17:45',
    thumbnail: '/images/partner-6.jpg',
    vimeoId: '123456846',
    isPremium: true
  }
]

export default function PartnerYogaPage() {
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  
  const handleVideoClick = (video: any) => {
    if (video.isPremium) {
      setShowPremiumModal(true)
    } else {
      // Handle free video play
      console.log('Playing video:', video.vimeoId)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Partner Yoga Activities</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => handleVideoClick(video)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity hover:bg-opacity-40"
              >
                {video.isPremium ? (
                  <FiLock className="h-12 w-12 text-white" />
                ) : (
                  <FiPlay className="h-12 w-12 text-white" />
                )}
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{video.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{video.duration}</span>
                {video.isPremium && (
                  <span className="text-sm font-medium text-primary-600">Premium</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Premium Content</h2>
            <p className="text-gray-600 mb-4">
              This video is only available to premium subscribers. Please upgrade your account to watch.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Handle upgrade
                  console.log('Upgrade clicked')
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
