'use client'

import { useState, useEffect, useRef } from 'react'
import { FiX, FiAlertCircle } from 'react-icons/fi'

interface VideoPlayerProps {
  videoId: string
  onClose: () => void
  title?: string
}

export default function VideoPlayer({ videoId, onClose, title }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Log when component mounts with videoId
  useEffect(() => {
    console.log(`VideoPlayer mounted with videoId: ${videoId}`)
    
    // Reset error state when videoId changes
    setError(null)
    setIsLoading(true)
    
    return () => {
      console.log(`VideoPlayer with videoId: ${videoId} unmounting`)
    }
  }, [videoId])

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
  
  // Handle iframe load and error events
  const handleIframeLoad = () => {
    console.log(`Iframe for video ${videoId} loaded successfully`)
    setIsLoading(false)
  }
  
  const handleIframeError = () => {
    console.error(`Error loading iframe for video ${videoId}`)
    setError(`Failed to load video ${videoId}. Please try again later.`)
    setIsLoading(false)
  }

  // Construct the Vimeo embed URL
  const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`

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
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
              <FiAlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-center px-4">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  // Force iframe to reload
                  if (iframeRef.current) {
                    const src = iframeRef.current.src
                    iframeRef.current.src = ''
                    setTimeout(() => {
                      if (iframeRef.current) iframeRef.current.src = src
                    }, 100)
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Retry
              </button>
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full z-20"
              style={{ display: 'block', position: 'relative' }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            ></iframe>
          )}
        </div>
        
        <div className="p-2 text-xs text-gray-400 text-center">
          Video ID: {videoId}
        </div>
      </div>
    </div>
  )
}
