'use client'

import { useState } from 'react'
import { FiPlay } from 'react-icons/fi'
import { Video } from '../lib/vimeo-browser'
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from '../components/ui/Card'
import VideoPlayer from './VideoPlayer'

interface FeaturedVideosProps {
  videos: Video[];
  isLoading: boolean;
}

export default function FeaturedVideos({ videos, isLoading }: FeaturedVideosProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };
  
  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {isLoading ? (
          <div className="col-span-3 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured videos...</p>
          </div>
        ) : (
          videos.map(video => (
            <div key={video.id} onClick={() => handleVideoClick(video)}>
              <Card hover={true} className="cursor-pointer">
                <div className="relative aspect-video overflow-hidden bg-gray-300">
                  {/* Video thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-primary-800/20 group-hover:from-primary-500/30 group-hover:to-primary-800/30 transition-all" />
                  <div className="flex items-center justify-center w-full h-full text-white">
                    <span className="text-lg font-medium">Video Thumbnail</span>
                  </div>
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary-600/90 text-white flex items-center justify-center transition-transform hover:scale-110">
                      <FiPlay size={24} />
                    </div>
                  </div>
                  
                  {/* Category and Free badge */}
                  <div className="absolute top-3 right-3 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    {(video.category === 'meditation' ? 'Meditation' : 
                     video.category === 'yoga-for-pe' ? 'Yoga for PE' : 'Relaxation')} • Free
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                
                <CardContent>
                  <CardTitle>{video.title}</CardTitle>
                  <CardDescription>{video.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{video.level}</span>
                    <span className="text-xs text-primary-600">Free</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))
        )}
      </div>
      
      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.vimeoId}
          title={selectedVideo.title}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </>
  );
}
