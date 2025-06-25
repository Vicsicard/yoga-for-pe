'use client'

import { FiLock, FiPlay } from 'react-icons/fi'
import { Video, SubscriptionTier, hasAccessToVideo } from '../lib/vimeo-browser'

interface VideoCardProps {
  video: Video;
  userSubscriptionTier: SubscriptionTier;
  onClick: (video: Video) => void;
}

export default function VideoCard({ video, userSubscriptionTier, onClick }: VideoCardProps) {
  const hasAccess = hasAccessToVideo(video, userSubscriptionTier);
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick(video)}
    >
      {/* Video thumbnail with play button overlay */}
      <div className="relative aspect-video bg-gray-200">
        {/* Thumbnail placeholder - in a real app, use video.thumbnail */}
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
            backgroundColor: video.tier === SubscriptionTier.GOLD 
              ? 'rgba(234, 179, 8, 0.9)' 
              : video.tier === SubscriptionTier.SILVER 
                ? 'rgba(148, 163, 184, 0.9)' 
                : 'rgba(59, 130, 246, 0.9)',
            color: 'white'
          }}
        >
          {video.tier === SubscriptionTier.GOLD 
            ? 'Gold' 
            : video.tier === SubscriptionTier.SILVER 
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
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{video.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{video.level}</span>
          <span className="text-xs text-gray-500">
            {video.tier === SubscriptionTier.BRONZE 
              ? 'Bronze (Free)' 
              : video.tier === SubscriptionTier.SILVER 
                ? 'Silver ($7.99)' 
                : 'Gold ($9.99)'}
          </span>
        </div>
      </div>
    </div>
  );
}
