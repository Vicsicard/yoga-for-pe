'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLock, FaPlay } from 'react-icons/fa';

// Instead of importing a non-existent formatter, define the function directly
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

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

  // Determine if this content is premium based on either the video's property or the component prop
  const isContentPremium = isPremiumContent || isPremium;
  
  // Generate video URL - for the demo we'll use a direct path but this could be a slug in production
  const videoUrl = `/direct-player?videoId=${id}`;
  
  // Category label mapping
  const categoryLabels = {
    'meditation': 'Meditation',
    'yoga-for-pe': 'Yoga for PE',
    'relaxation': 'Relaxation',
    'yoga': 'Yoga'
  };
  
  // Map section to category if not already set
  const displayCategory = categoryLabels[category] || 
                          categoryLabels[videoSection] ||
                          'Yoga';
  
  // Difficulty label mapping with color classes
  const difficultyConfig = {
    'beginner': { label: 'Beginner', colorClass: 'bg-green-100 text-green-800' },
    'intermediate': { label: 'Intermediate', colorClass: 'bg-blue-100 text-blue-800' },
    'advanced': { label: 'Advanced', colorClass: 'bg-purple-100 text-purple-800' }
  };
  
  // Get difficulty config or default
  const difficultyConfig2 = difficultyConfig[difficulty] || difficultyConfig.beginner;
  const difficultyLabel = difficultyConfig2.label;
  const difficultyColor = difficultyConfig2.colorClass;

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Video thumbnail with overlay */}
      <div className="relative aspect-video">
        <Image 
          src={thumbnail || '/images/placeholder-thumbnail.jpg'} 
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={false}
        />
        
        {/* Overlay with play button or lock icon */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-full bg-white bg-opacity-90 p-3 transform transition-transform group-hover:scale-110">
            {isContentPremium ? (
              <FaLock className="text-blue-600" size={20} />
            ) : (
              <FaPlay className="text-blue-600" size={20} />
            )}
          </div>
        </div>
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs font-medium py-1 px-2 rounded">
          {formatDuration(duration)}
        </div>
        
        {/* Premium badge if applicable */}
        {isContentPremium && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold py-1 px-2 rounded">
            PREMIUM
          </div>
        )}
      </div>
      
      {/* Card content */}
      <div className="p-4">
        <Link href={videoUrl} className="block">
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-2">
          {/* Category */}
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {displayCategory}
          </span>
          
          {/* Difficulty */}
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${difficultyColor}`}>
            {difficultyLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
