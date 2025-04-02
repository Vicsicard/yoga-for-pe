'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPlay } from 'react-icons/fi'

const videoCategories = [
  {
    id: 'introduction-to-yoga',
    title: 'Introduction to Yoga for PE',
    description: 'A comprehensive introduction to implementing yoga in physical education classes',
    thumbnail: '/images/video-thumbnail1.jpg',
    videoCount: 6
  },
  {
    id: 'sun-salutation',
    title: 'Sun Salutation Series',
    description: 'A simple flow sequence perfect for classroom warm-ups',
    thumbnail: '/images/video-thumbnail2.jpg',
    videoCount: 6
  },
  {
    id: 'balance-poses',
    title: 'Balance Poses for Focus',
    description: 'Improve concentration and mental focus with these balance poses',
    thumbnail: '/images/video-thumbnail3.jpg',
    videoCount: 6
  },
  {
    id: 'general-yoga-flow',
    title: 'General Yoga Flow',
    description: 'Essential yoga flows and sequences for all levels',
    thumbnail: '/images/video-thumbnail4.jpg',
    videoCount: 6
  },
  {
    id: 'partner-yoga',
    title: 'Partner Yoga Activities',
    description: 'Fun partner exercises to build trust and cooperation',
    thumbnail: '/images/video-thumbnail5.jpg',
    videoCount: 6
  },
  {
    id: 'athletic-performance',
    title: 'Yoga for Athletic Performance',
    description: 'Enhance athletic abilities with these targeted yoga sequences',
    thumbnail: '/images/video-thumbnail6.jpg',
    videoCount: 6
  }
]

export default function VideosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Yoga for PE Videos</h1>
      <p className="text-gray-600 mb-8">
        Explore our comprehensive collection of yoga videos designed specifically for physical education.
        Each category offers specialized content to enhance your PE curriculum.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoCategories.map((category) => (
          <Link 
            href={`/videos/${category.id}`} 
            key={category.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={category.thumbnail}
                alt={category.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity hover:bg-opacity-30">
                <FiPlay className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{category.description}</p>
              <div className="text-sm text-primary-600">
                {category.videoCount} videos available
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
