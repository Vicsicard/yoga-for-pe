'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLock, FaPlay } from 'react-icons/fa';
import { formatDuration } from '../lib/utils/formatters';

export default function VideoCard({ video, isPremium = false, videoSection }) {
  // Default values for video properties
  const {
    id = '',
    title = 'Video Title',
    thumbnail = '/images/placeholder-thumbnail.jpg',
    duration = 0,
    category = 'yoga',
    difficulty = 'beginner',
    isPremiumContent = false,
    slug = '',
  } = video || {};

  // Handle premium content display
  const isLocked = isPremiumContent && !isPremium;
  
  // Format duration for display
  const formattedDuration = formatDuration(duration);
  
  // Format category for display
  const getCategoryDisplay = (cat) => {
    switch (cat) {
      case 'yoga':
        return 'Yoga';
      case 'meditation':
        return 'Meditation';
      case 'yoga-for-pe':
        return 'Yoga for PE';
      default:
        return cat.charAt(0).toUpperCase() + cat.slice(1);
    }
  };

  // Handle card click
  const handleCardClick = (e) => {
    if (isLocked) {
      e.preventDefault();
      // Show premium modal logic would go here
      document.dispatchEvent(new CustomEvent('show-premium-modal'));
    }
  };

  return (
    <Link 
      href={`/videos/${slug}`}
      onClick={handleCardClick}
      className={`block group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white h-full ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {/* Thumbnail with duration badge */}
      <div className="relative aspect-video">
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {formattedDuration}
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className={`rounded-full p-3 ${isLocked ? 'bg-gray-700' : 'bg-primary-500'} bg-opacity-90`}>
            {isLocked ? (
              <FaLock className="text-white" size={20} />
            ) : (
              <FaPlay className="text-white ml-1" size={20} />
            )}
          </div>
        </div>
        
        {/* Premium indicator */}
        {isPremiumContent && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded text-gray-900 flex items-center">
            <FaLock className="mr-1" size={10} />
            PREMIUM
          </div>
        )}
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <h3 className={`font-medium mb-1 line-clamp-2 ${isLocked ? 'text-gray-500' : 'text-gray-800'}`}>
          {title}
        </h3>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {getCategoryDisplay(category)} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
          
          {videoSection === 'featured' && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
