'use client'

import { FiRefreshCw } from 'react-icons/fi'
import { Video, SubscriptionTier } from '../lib/vimeo-browser'
import VideoCard from './VideoCard'



export default function FilteredVideoResults({ 
  title, 
  videos, 
  isLoading, 
  userSubscriptionTier,
  onVideoClick,
  onLoadMore
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      {videos.length === 0 ? (
        <p className="text-gray-500">No videos found matching your criteria.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video} 
                userSubscriptionTier={userSubscriptionTier}
                onClick={onVideoClick}
                section={video.category}
              />
            ))}
          </div>
          
          {/* Load more button for filtered results */}
          <div className="mt-8 text-center">
            <button 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center mx-auto"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>Show Next Videos
                  <FiRefreshCw className="ml-2" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
