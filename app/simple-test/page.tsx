'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Vimeo Player Test</h1>
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
        
        <iframe 
          src="https://player.vimeo.com/video/457053392?autoplay=1&title=0&byline=0&portrait=0"
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        ></iframe>
      </div>
      
      <div className="mt-4">
        <p className="text-lg">This is a direct embed of a Vimeo video (ID: 457053392)</p>
        <p className="text-sm text-gray-600 mt-2">If this video doesn't load, there might be an issue with:</p>
        <ul className="list-disc ml-6 mt-1 text-sm text-gray-600">
          <li>The Vimeo video ID being invalid or private</li>
          <li>Content Security Policy blocking the iframe</li>
          <li>Network connectivity to Vimeo's servers</li>
        </ul>
      </div>
    </div>
  )
}
