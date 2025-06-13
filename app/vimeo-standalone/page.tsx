'use client';

import { useState } from 'react';
import { FiLock, FiPlay } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import the VimeoPlayer component with no SSR to avoid hydration issues
const VimeoPlayer = dynamic(() => import('../../components/VimeoPlayer'), { ssr: false });

export default function VimeoStandalone() {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  
  // Sample videos with different privacy settings
  const demoVideos = [
    {
      id: '76979871', // This is a public Vimeo demo video
      title: 'Public Video Example',
      description: 'This is a public video that anyone can watch',
      isPremium: false
    },
    {
      id: '824804225', // Another public Vimeo demo video
      title: 'Premium Content Example',
      description: 'This video demonstrates premium content access control',
      isPremium: true
    }
  ];

  const handleVideoClick = (video: any) => {
    if (video.isPremium) {
      setShowPremiumModal(true);
    } else {
      setCurrentVideo(video.id);
    }
  };

  const handleSubscribe = () => {
    // In a real implementation, this would redirect to Vimeo's subscription page
    // or handle the subscription process
    alert('This would redirect to the Vimeo subscription page');
    setShowPremiumModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Simple navbar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary-600">Yoga for PE - Vimeo Demo</h1>
        </div>
      </nav>
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Vimeo Integration Demo</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Player Demo</h2>
          {currentVideo ? (
            <div className="mb-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {currentVideo && (
                  <VimeoPlayer 
                    videoId={currentVideo}
                    responsive={true}
                    className="rounded-lg shadow-lg"
                    onPlay={() => console.log('Video started playing')}
                    onEnd={() => console.log('Video ended')}
                  />
                )}
              </div>
              <button 
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setCurrentVideo(null)}
              >
                Close Video
              </button>
            </div>
          ) : (
            <p className="text-gray-600">Select a video below to play</p>
          )}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Available Videos</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {demoVideos.map((video) => (
              <div 
                key={video.id} 
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleVideoClick(video)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{video.title}</h3>
                  {video.isPremium && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <FiLock className="mr-1" size={12} />
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{video.description}</p>
                <div className="relative aspect-video bg-gray-200 rounded mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center">
                    <FiPlay size={24} />
                  </div>
                  {video.isPremium && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                      <FiLock className="mr-1" size={12} />
                      Premium
                    </div>
                  )}
                </div>
                <button 
                  className={`px-4 py-2 rounded ${video.isPremium ? 'bg-yellow-500 text-white' : 'bg-blue-600 text-white'}`}
                >
                  {video.isPremium ? 'Unlock Premium' : 'Watch Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Vimeo Authentication & Subscription Options</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Vimeo OTT (Over-The-Top)</h3>
            <p className="mb-2">Vimeo OTT provides:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Built-in subscription management</li>
              <li>User authentication system</li>
              <li>Payment processing</li>
              <li>Content access control</li>
            </ul>
            <p className="text-sm text-gray-600">Note: Requires Vimeo Enterprise or OTT plan</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Custom Implementation</h3>
            <p className="mb-2">Alternatively, you can:</p>
            <ul className="list-disc pl-6">
              <li>Use Vimeo's privacy settings to protect videos</li>
              <li>Implement your own authentication (Clerk)</li>
              <li>Handle payments separately (Stripe)</li>
              <li>Control access to video IDs based on subscription status</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Simple footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center">© 2025 Yoga for PE. All rights reserved.</p>
        </div>
      </footer>

      {/* Premium Content Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Premium Content</h3>
            <p className="mb-6">
              This video is part of our premium content. Subscribe to access our complete library of videos and resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="btn bg-yellow-500 text-white px-4 py-2 rounded flex-1"
                onClick={handleSubscribe}
              >
                Subscribe Now
              </button>
              <button 
                className="btn bg-gray-200 px-4 py-2 rounded flex-1"
                onClick={() => setShowPremiumModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
