'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiLock, FiPlayCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '../lib/hooks/useAuth';

/**
 * PremiumModal Component
 * Displays a modal when users try to access premium content without subscription
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} videoTitle - Title of the video being accessed
 * @returns {JSX.Element}
 */
export default function PremiumModal({ isOpen, onClose, videoTitle }) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  // Track visibility for animation
  const [isVisible, setIsVisible] = useState(false);
  
  // Track sign-in status - Fixed const reassignment issue
  const [isSignedIn, setIsSignedIn] = useState(false);
  let userId = null;
  let authChecked = false;
  
  try {
    const { user, isAuthenticated } = useAuth();
    // Instead of reassigning const variable, we use useState's setter
    if (isAuthenticated !== isSignedIn) {
      setIsSignedIn(isAuthenticated);
    }
    userId = user?.id || null;
    authChecked = true;
  } catch (error) {
    console.error('Error accessing auth context:', error);
    authChecked = true;
  }

  // Debug logging function
  const logDebug = (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`PremiumModal Debug: ${message}`);
    }
  };
  
  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);
  
  // Close modal and redirect if necessary
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  // Redirect to sign in page
  const handleSignIn = () => {
    handleClose();
    setTimeout(() => {
      router.push('/sign-in');
    }, 300);
  };
  
  // Redirect to pricing page
  const handleSubscribe = () => {
    handleClose();
    setTimeout(() => {
      router.push('/pricing');
    }, 300);
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all duration-300 scale-100">
        {/* Close button */}
        <button onClick={handleClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <FiX size={24} />
        </button>
        
        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <FiLock size={28} className="text-blue-600" />
          </div>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-center mb-2">Premium Content</h3>
        
        <p className="text-gray-600 text-center mb-6">
          {videoTitle ? (
            <>"{videoTitle}" is available with our premium subscription.</>
          ) : (
            <>This content is available with our premium subscription.</>
          )}
        </p>
        
        {isSignedIn ? (
          <>
            <p className="text-center text-gray-600 mb-4">
              You're signed in, but need a premium subscription to access this content.
            </p>
            
            <button
              onClick={handleSubscribe}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FiPlayCircle size={20} />
              <span>Subscribe Now</span>
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-4">
              Sign in to access premium content or subscribe now.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSignIn}
                className="py-3 px-4 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                Sign In
              </button>
              
              <button
                onClick={handleSubscribe}
                className="py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
