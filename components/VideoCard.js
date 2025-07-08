'use client'

import { useState } from 'react'
import { FiLock, FiPlay, FiInfo } from 'react-icons/fi'
import { Video, SubscriptionTier, hasAccessToVideo } from '../lib/vimeo-browser'
import { getThumbnailPath } from '../lib/thumbnail-mapping'



// Helper function to determine the folder name based on video data and section
function getCategoryFolder(video, videoSection) {
  // If we know the section directly, use it
  if (videoSection) {
    return videoSection;
  }
  
  // Otherwise fall back to checking the video title keywords
  const title = video.title.toLowerCase();
  
  if (title.includes('warrior') || 
      title.includes('sun salutation') || 
      title.includes('ab circle') ||
      title.includes('chop shop') ||
      title.includes('firefighter') ||
      title.includes('branch out') ||
      title.includes('open the gate') ||
      title.includes('dog days') ||
      title.includes('it bands')) {
    return 'yoga-for-pe';
  }
  
  if (title.includes('meditation') || title.includes('breath')) {
    return 'meditation';
  }
  
  if (title.includes('relax')) {
    return 'relaxation';
  }
  
  if (title.includes('champion') || title.includes('thunder') || title.includes('fight song')) {
    return 'mindful-movements';
  }
  
  // Default to yoga-for-pe if we can't determine the category
  return 'yoga-for-pe';
}

export default function VideoCard({ video, userSubscriptionTier, onClick, section }) {
  // Use the proper 
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Handle mouse events
  const handleInfoClick = (e) => {
    e.stopPropagation(); // Prevent video click
    setShowFullDescription(!showFullDescription);
  };

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={() => onClick(video)}
      onMouseLeave={() => setShowFullDescription(false)}
    >
      {/* Video thumbnail with play button overlay */}
      <div className="relative aspect-video bg-gray-200">
        <img 
          src={video.thumbnail || getThumbnailPath(video.title, getCategoryFolder(video, section))} 
          alt={video.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log(`Failed to load thumbnail: ${video.title}`);
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary-500/80 flex items-center justify-center">
            {video.tier !== SubscriptionTier.BRONZE && !hasAccess ? (
              <FiLock className="text-white text-2xl" />
            ) : (
              <FiPlay className="text-white text-2xl" />
            )}
          </div>
        </div>
        
        {/* Subscription tier badge */}
        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium" 
          style={{
            backgroundColor=== SubscriptionTier.GOLD 
              ? 'rgba(234, 179, 8, 0.9)' 
              === SubscriptionTier.SILVER 
                ? 'rgba(148, 163, 184, 0.9)' 
                : 'rgba(59, 130, 246, 0.9)',
            color: 'white'
          }}
        >
          {video.tier === SubscriptionTier.GOLD 
            ? 'Gold' 
            === SubscriptionTier.SILVER 
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
        <p className="text-sm text-gray-600 line-clamp-2 mb-1">{video.description}</p>
        <button 
          onClick={handleInfoClick}
          className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1 mb-2 font-medium"
          title="Show full description"
          aria-label="Show full description"
        >
          <FiInfo size={14} />
          <span>Read full description
        </button>
        <div className="flex justify-between items-center">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{video.level}</span>
          <span className="text-xs text-gray-500">
            {video.tier === SubscriptionTier.BRONZE 
              ? 'Bronze (Free)' 
              === SubscriptionTier.SILVER 
                ? 'Silver ($7.99)' 
                : 'Gold ($9.99)'}
          </span>
        </div>
      </div>
      
      {/* Full description popup */}
      {showFullDescription && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowFullDescription(false)}
        >
          <div 
            className="relative bg-white p-5 rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullDescription(false);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h4 className="font-bold text-lg mb-3 pr-6">{video.title}</h4>
            <p className="text-gray-700 mb-4">{video.description}</p>
            <div className="text-sm text-gray-500 flex justify-between border-t border-gray-100 pt-3">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {video.duration}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20h.01"></path>
                  <path d="M7 20v-4"></path>
                  <path d="M12 20v-8"></path>
                  <path d="M17 20v-6"></path>
                </svg>
                {video.level}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
