'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiChevronDown, FiChevronRight, FiUser } from 'react-icons/fi';
import { useAuth } from '../lib/hooks/useAuth';
// Removed ProfileDropdown import as it's causing issues

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  
  // Get auth status
  const { isAuthenticated, user } = useAuth();
  
  // Handle scroll event for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(dropdown);
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center">
            <span className="mr-2">YogaForPE</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <div className="relative group">
              <button 
                onClick={() => toggleDropdown('videos')}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Videos</span>
                <FiChevronDown className={`transform transition-transform ${activeDropdown === 'videos' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'videos' && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/videos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    All Videos
                  </Link>
                  <Link href="/videos?category=meditation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Meditation
                  </Link>
                  <Link href="/videos?category=yoga-for-pe" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Yoga for PE
                  </Link>
                  <Link href="/videos?category=relaxation" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Relaxation
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/blogs" className="text-gray-700 hover:text-blue-600 transition-colors">
              Blog
            </Link>
            
            <div className="relative group">
              <button 
                onClick={() => toggleDropdown('resources')}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Resources</span>
                <FiChevronDown className={`transform transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>
              
              {activeDropdown === 'resources' && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/shop" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Shop
                  </Link>
                  <Link href="/guest-speaking" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Guest Speaking
                  </Link>
                  <Link href="/travel" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
                    Travel
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
          
          {/* User Menu - Simplified without ProfileDropdown */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/account" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                <FiUser />
                <span>Account</span>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600">
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="md:hidden bg-white border-t mt-2 py-4 px-4 shadow-lg">
          <div className="space-y-4">
            <div>
              <button 
                onClick={() => toggleDropdown('mobile-videos')}
                className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Videos</span>
                <FiChevronRight className={`transform transition-transform ${activeDropdown === 'mobile-videos' ? 'rotate-90' : ''}`} />
              </button>
              
              {activeDropdown === 'mobile-videos' && (
                <div className="pl-4 pt-2 space-y-2">
                  <Link href="/videos" className="block py-1 text-gray-700 hover:text-blue-600">
                    All Videos
                  </Link>
                  <Link href="/videos?category=meditation" className="block py-1 text-gray-700 hover:text-blue-600">
                    Meditation
                  </Link>
                  <Link href="/videos?category=yoga-for-pe" className="block py-1 text-gray-700 hover:text-blue-600">
                    Yoga for PE
                  </Link>
                  <Link href="/videos?category=relaxation" className="block py-1 text-gray-700 hover:text-blue-600">
                    Relaxation
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/blogs" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors">
              Blog
            </Link>
            
            <div>
              <button 
                onClick={() => toggleDropdown('mobile-resources')}
                className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Resources</span>
                <FiChevronRight className={`transform transition-transform ${activeDropdown === 'mobile-resources' ? 'rotate-90' : ''}`} />
              </button>
              
              {activeDropdown === 'mobile-resources' && (
                <div className="pl-4 pt-2 space-y-2">
                  <Link href="/shop" className="block py-1 text-gray-700 hover:text-blue-600">
                    Shop
                  </Link>
                  <Link href="/guest-speaking" className="block py-1 text-gray-700 hover:text-blue-600">
                    Guest Speaking
                  </Link>
                  <Link href="/travel" className="block py-1 text-gray-700 hover:text-blue-600">
                    Travel
                  </Link>
                </div>
              )}
            </div>
            
            <Link href="/contact" className="block py-2 text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>
            
            <div className="pt-4 border-t">
              {isAuthenticated ? (
                <Link href="/account" className="block py-2 text-gray-700 hover:text-blue-600">
                  My Account
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link href="/sign-in" className="block py-2 text-gray-700 hover:text-blue-600">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
