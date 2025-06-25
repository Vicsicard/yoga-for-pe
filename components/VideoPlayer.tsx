'use client'

import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'

interface VideoPlayerProps {
  videoId: string
  onClose: () => void
  title?: string
}

export default function VideoPlayer({ videoId, onClose, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Handle escape key to close the modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">{title || 'Video'}</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close video"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="relative aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          <iframe 
            src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
  )
}
