'use client'

import { useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { VideoCategory, SubscriptionTier, Video } from '../lib/vimeo-browser'
import VideoCard from './VideoCard'

interface VideoSectionProps {
  title: string;
  description: string;
  videos: Video[];
  isLoading: boolean;
  userSubscriptionTier: SubscriptionTier | null;
  onVideoClick: (video: Video) => void;
  onLoadMore: () => void;
  isExpanded?: boolean; // New prop to track if this section is showing 6 videos
  sectionName?: string; // Optional section name to help with thumbnail mapping
}

export default function VideoSection({ 
  title, 
  description, 
  videos, 
  isLoading, 
  userSubscriptionTier,
  onVideoClick,
  onLoadMore,
  isExpanded = false,
  sectionName
}: VideoSectionProps) {
  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, idx) => (
          <VideoCard 
            key={video.id || video.vimeoId || video.title || idx}
            video={video} 
            userSubscriptionTier={userSubscriptionTier}
            onClick={onVideoClick}
            section={sectionName || (title.toLowerCase().includes('meditation') ? 'meditation' : 
                    title.toLowerCase().includes('yoga') ? 'yoga-for-pe' : 
                    title.toLowerCase().includes('relaxation') ? 'relaxation' : undefined)}
          />
        ))}
      </div>
      
      {/* Load more button */}
      <div className="mt-6 text-center">
        <button 
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
          onClick={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <>
              <span>{isExpanded ? 'Show Next Videos' : 'Show More Videos'}</span>
              <FiRefreshCw className="ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
