'use client';

import React from 'react';
import VideoCard from './VideoCard';

// Helper function to determine video section from title
function getVideoSectionFromTitle(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('meditation')) {
    return 'meditation';
  } else if (lowerTitle.includes('yoga')) {
    return 'yoga-for-pe';
  } else if (lowerTitle.includes('relaxation')) {
    return 'relaxation';
  } else {
    return '';
  }
}

export default function VideoSection({ 
  title, 
  videos = [], 
  isPremium = false, 
  onVideoClick,
  sectionName
}) {
  if (!videos || videos.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video}
            isPremium={isPremium}
            onClick={onVideoClick}
            videoSection={sectionName || getVideoSectionFromTitle(title)}
          />
        ))}
      </div>
    </div>
  );
}
