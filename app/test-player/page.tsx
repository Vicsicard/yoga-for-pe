'use client'

import { useState } from 'react'
import VideoPlayer from '../../components/VideoPlayer'

export default function TestPlayerPage() {
  const [videoId, setVideoId] = useState('1095788590') // Default to Ab Circle 1 which we know works
  const [showPlayer, setShowPlayer] = useState(false)
  const [customVideoId, setCustomVideoId] = useState('')

  const handlePlayVideo = () => {
    setShowPlayer(true)
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
  }

  const handleCustomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomVideoId(e.target.value)
  }

  const handleUseCustomId = () => {
    if (customVideoId) {
      setVideoId(customVideoId)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vimeo Player Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Test with known video IDs:</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setVideoId('457053392')} // Meditation
            className={`px-3 py-1 rounded ${videoId === '457053392' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Meditation (457053392)
          </button>
          <button 
            onClick={() => setVideoId('1095788590')} // Yoga for PE
            className={`px-3 py-1 rounded ${videoId === '1095788590' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Yoga for PE (1095788590)
          </button>
          <button 
            onClick={() => setVideoId('452426275')} // Relaxation
            className={`px-3 py-1 rounded ${videoId === '452426275' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Relaxation (452426275)
          </button>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Test with custom video ID:</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customVideoId}
            onChange={handleCustomIdChange}
            placeholder="Enter Vimeo video ID"
            className="px-3 py-1 border rounded"
          />
          <button 
            onClick={handleUseCustomId}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Use This ID
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Current video ID: {videoId}</h2>
        <button 
          onClick={handlePlayVideo}
          className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
        >
          Play Video
        </button>
      </div>
      
      {showPlayer && (
        <VideoPlayer 
          videoId={videoId} 
          onClose={handleClosePlayer} 
          title="Test Video Player"
        />
      )}
    </div>
  )
}
