'use client'

import { useState } from 'react'
import { FiPlay, FiLock } from 'react-icons/fi'

const videos = [
  {
    id: 1,
    title: 'Yoga for Sports Performance',
    description: 'Essential yoga poses to enhance athletic abilities',
    duration: '24:30',
    thumbnail: '/images/athletic-1.jpg',
    vimeoId: '123456851',
    isPremium: false
  },
  {
    id: 2,
    title: 'Flexibility for Athletes',
    description: 'Targeted stretches for improved athletic performance',
    duration: '22:45',
    thumbnail: '/images/athletic-2.jpg',
    vimeoId: '123456852',
    isPremium: true
  },
  {
    id: 3,
    title: 'Core Power for Sports',
    description: 'Core-strengthening yoga poses for athletes',
    duration: '25:20',
    thumbnail: '/images/athletic-3.jpg',
    vimeoId: '123456853',
    isPremium: true
  },
  {
    id: 4,
    title: 'Recovery Yoga Sequence',
    description: 'Post-workout recovery and stretching routine',
    duration: '20:15',
    thumbnail: '/images/athletic-4.jpg',
    vimeoId: '123456854',
    isPremium: false
  },
  {
    id: 5,
    title: 'Balance and Agility',
    description: 'Yoga poses to improve balance and agility for sports',
    duration: '23:30',
    thumbnail: '/images/athletic-5.jpg',
    vimeoId: '123456855',
    isPremium: true
  },
  {
    id: 6,
    title: 'Mental Focus Training',
    description: 'Yoga and meditation for athletic mental preparation',
    duration: '19:45',
    thumbnail: '/images/athletic-6.jpg',
    vimeoId: '123456856',
    isPremium: true
  }
]

export default function AthleticPerformancePage() {
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
      <h1 className="text-3xl font-bold mb-8">Yoga for Athletic Performance</h1>
      
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
