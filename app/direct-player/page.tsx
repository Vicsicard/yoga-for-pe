'use client'

import { useState, useEffect, useRef } from 'react'
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

export default function DirectPlayerPage() {
  const [selectedVideo, setSelectedVideo] = useState('1095788590')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online')
  const [logs, setLogs] = useState<Array<{type: 'info' | 'error' | 'success', message: string}>>([]) 
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  // Log function that both logs to console and updates UI
  const log = (type: 'info' | 'error' | 'success', message: string) => {
    console[type === 'error' ? 'error' : type === 'success' ? 'log' : 'info'](message)
    setLogs(prev => [...prev, { type, message: `${new Date().toLocaleTimeString()}: ${message}` }])
  }

  // Check network status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online')
      log('success', 'Network connection restored')
    }
    
    const handleOffline = () => {
      setNetworkStatus('offline')
      log('error', 'Network connection lost')
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial log
    log('info', `Page loaded. Network status: ${navigator.onLine ? 'online' : 'offline'}`)
    log('info', `User agent: ${navigator.userAgent}`)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Handle video selection
  useEffect(() => {
    setLoading(true)
    setError(null)
    log('info', `Video selected: ${selectedVideo}`)
    
    // Check if Vimeo domain is accessible
    fetch('https://vimeo.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-cache'
    })
    .then(() => log('info', 'Vimeo domain is accessible'))
    .catch(err => log('error', `Cannot access Vimeo domain: ${err.message}`))
    
    // Test if we can fetch video metadata (won't work due to CORS, but useful for debugging)
    fetch(`https://api.vimeo.com/videos/${selectedVideo}`, { 
      mode: 'no-cors',
      cache: 'no-cache'
    })
    .then(() => log('info', 'Attempted to fetch video metadata'))
    .catch(err => log('error', `Metadata fetch attempt error: ${err.message}`))
  }, [selectedVideo])
  
  // Handle iframe events
  const handleIframeLoad = () => {
    log('success', `Iframe for video ${selectedVideo} loaded`)
    setLoading(false)
  }
  
  const handleIframeError = () => {
    log('error', `Failed to load iframe for video ${selectedVideo}`)
    setError(`Failed to load video ${selectedVideo}. Please check console for details.`)
    setLoading(false)
  }
  
  const retryLoading = () => {
    log('info', 'Retrying video load...')
    setLoading(true)
    setError(null)
    
    // Force iframe to reload
    if (iframeRef.current) {
      const src = iframeRef.current.src
      iframeRef.current.src = ''
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = src
          log('info', `Reloaded iframe with src: ${src}`)
        }
      }, 100)
    }
  }
  
  // Construct the Vimeo embed URL with debug parameters
  const embedUrl = `https://player.vimeo.com/video/${selectedVideo}?title=0&byline=0&portrait=0&debug=1`
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct Vimeo Player Test</h1>
      
      {/* Network status indicator */}
      <div className={`mb-4 p-2 rounded-md ${networkStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        Network status: {networkStatus.toUpperCase()}
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Video:</label>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedVideo('1095788590')}
            className={`px-3 py-1 rounded ${selectedVideo === '1095788590' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Ab Circle 1
          </button>
          <button 
            onClick={() => setSelectedVideo('452426275')}
            className={`px-3 py-1 rounded ${selectedVideo === '452426275' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Body Scan
          </button>
          <button 
            onClick={() => setSelectedVideo('1095789404')}
            className={`px-3 py-1 rounded ${selectedVideo === '1095789404' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Ab Circle 2
          </button>
          <button 
            onClick={() => setSelectedVideo('123456789')}
            className={`px-3 py-1 rounded ${selectedVideo === '123456789' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Invalid ID (Test)
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Video ID: {selectedVideo}</h2>
        
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
              <FiAlertCircle size={48} className="text-red-500 mb-4" />
              <p className="text-center px-4">{error}</p>
              <button 
                onClick={retryLoading}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
              >
                <FiRefreshCw className="mr-2" /> Retry
              </button>
            </div>
          ) : (
            <iframe 
              ref={iframeRef}
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            ></iframe>
          )}
        </div>
      </div>
      
      {/* Debug information */}
      <div className="mt-4 p-4 border border-blue-300 bg-blue-50 rounded-lg">
        <h3 className="font-semibold">Debug Information:</h3>
        <div className="mt-2 text-sm">
          <p><strong>Embed URL:</strong> {embedUrl}</p>
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {error || 'None'}</p>
        </div>
      </div>
      
      {/* Console logs */}
      <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded-lg">
        <h3 className="font-semibold flex items-center justify-between">
          <span>Console Logs</span>
          <button 
            onClick={() => setLogs([])}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Clear
          </button>
        </h3>
        <div className="mt-2 max-h-60 overflow-y-auto bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No logs yet</p>
          ) : (
            logs.map((log, i) => (
              <div 
                key={i} 
                className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-300'} mb-1`}
              >
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold">Troubleshooting Notes:</h3>
        <ul className="list-disc ml-5 mt-2">
          <li>This page uses direct iframe embedding without the VideoPlayer component</li>
          <li>Check the console logs above for detailed error information</li>
          <li>If videos don't play, check for Content Security Policy restrictions in your Next.js config</li>
          <li>Try opening the Network tab in browser DevTools to see if requests to Vimeo are being blocked</li>
          <li>The "Invalid ID" button can be used to test error handling</li>
        </ul>
      </div>
    </div>
  )
}
