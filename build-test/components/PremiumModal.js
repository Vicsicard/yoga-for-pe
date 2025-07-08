'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaTimes, FaLock } from 'react-icons/fa';

// Import the useAuth hook for user authentication
import { useAuth } from '../lib/hooks/useAuth';

// Debug logging function with proper parameter declaration
function logDebug(message, data) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[PremiumModal] ${message}`, data || '');
  }
}

export default function PremiumModal({ onClose, showSubscribeButton = true }) {
  // Track if the modal has been shown to prevent repeated displays
  const [hasShownModal, setHasShownModal] = useState(false);
  
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  
  // Track sign-in status
  const [isSignedIn, setIsSignedIn] = useState(false);
  let userId = null;
  
  try {
    const { user, isAuthenticated } = useAuth();
    isSignedIn = isAuthenticated;
    userId = user?.id || null;
  } catch (error) {
    console.error('Error accessing auth context:', error);
  }

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>
      
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full transition-all duration-300 transform ${isVisible ? 'scale-100' : 'scale-95'}`}>
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close modal"
        >
          <FaTimes size={24} />
        </button>

        {/* Premium content image */}
        <div className="relative h-48 rounded-t-lg overflow-hidden">
          <Image 
            src="/images/premium-banner.jpg" 
            alt="Premium Content" 
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-50"></div>
          <div className="absolute bottom-4 left-4 flex items-center">
            <FaLock className="text-yellow-400 mr-2" size={20} />
            <span className="text-white font-semibold text-lg">Premium Content</span>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Unlock Premium Videos</h3>
          <p className="text-gray-600 mb-6">
            This video is exclusive to our premium subscribers. Sign up now to access our complete library 
            of yoga and mindfulness videos.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {showSubscribeButton && (
              <Link 
                href="/sign-up"
                className="flex-1 bg-gradient-to-r from-blue-500 to-teal-400 text-white py-2 px-4 rounded-lg font-medium text-center hover:from-blue-600 hover:to-teal-500 transition-all"
              >
                Subscribe Now
              </Link>
            )}
            
            {!isSignedIn && (
              <Link 
                href="/sign-in"
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-50 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
