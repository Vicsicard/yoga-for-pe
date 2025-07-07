'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiChevronDown, FiChevronRight, FiUser } from 'react-icons/fi';
import { useAuth } from '../lib/hooks/useAuth';
import ProfileDropdown from './ProfileDropdown';

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
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    
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

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  const navClasses = `fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
  }`;
  
  const textColorClass = isScrolled ? 'text-gray-800' : 'text-white';
  
  return (
    <nav className={navClasses} ref={menuRef}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMenu}>
            <Image 
              src={isScrolled ? "/images/logo-dark.png" : "/images/logo-light.png"} 
              alt="Yoga for PE Logo"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Videos dropdown */}
            <div className="relative group">
              <button 
                className={`flex items-center ${textColorClass} hover:text-primary-500 font-medium`}
                onClick={() => toggleDropdown('videos')}
                aria-expanded={activeDropdown === 'videos'}
              >
                Videos
                <FiChevronDown className="ml-1" />
              </button>
              
              {activeDropdown === 'videos' && (
                <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-lg overflow-hidden z-20">
                  <Link href="/videos/all" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>All Videos</Link>
                  <Link href="/videos/yoga" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>Yoga</Link>
                  <Link href="/videos/meditation" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>Meditation</Link>
                  <Link href="/videos/mindfulness" className="block px-4 py-2 text-gray-800 hover:bg-gray-100" onClick={closeMenu}>Mindfulness</Link>
                </div>
              )}
            </div>
            
            <Link href="/plans" className={`${textColorClass} hover:text-primary-500 font-medium`} onClick={closeMenu}>
              Lesson Plans
            </Link>
            
            <Link href="/pricing" className={`${textColorClass} hover:text-primary-500 font-medium`} onClick={closeMenu}>
              Pricing
            </Link>
            
            <Link href="/blog" className={`${textColorClass} hover:text-primary-500 font-medium`} onClick={closeMenu}>
              Blog
            </Link>
            
            <Link href="/about" className={`${textColorClass} hover:text-primary-500 font-medium`} onClick={closeMenu}>
              About
            </Link>
          </div>
          
          {/* Auth Buttons / Profile */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <ProfileDropdown user={user} />
            ) : (
              <>
                <Link 
                  href="/sign-in" 
                  className={`${textColorClass} hover:text-primary-500 font-medium`}
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${textColorClass} p-2`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg absolute top-full left-0 right-0 overflow-hidden z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-3">
              <div className="py-2">
                <button 
                  onClick={() => toggleDropdown('mobileVideos')}
                  className="flex justify-between items-center w-full text-left text-gray-800 hover:text-primary-500"
                >
                  <span>Videos</span>
                  {activeDropdown === 'mobileVideos' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                
                {activeDropdown === 'mobileVideos' && (
                  <div className="pl-4 mt-2 space-y-2">
                    <Link href="/videos/all" className="block py-1 text-gray-600 hover:text-primary-500" onClick={closeMenu}>All Videos</Link>
                    <Link href="/videos/yoga" className="block py-1 text-gray-600 hover:text-primary-500" onClick={closeMenu}>Yoga</Link>
                    <Link href="/videos/meditation" className="block py-1 text-gray-600 hover:text-primary-500" onClick={closeMenu}>Meditation</Link>
                    <Link href="/videos/mindfulness" className="block py-1 text-gray-600 hover:text-primary-500" onClick={closeMenu}>Mindfulness</Link>
                  </div>
                )}
              </div>
              
              <Link href="/plans" className="py-2 text-gray-800 hover:text-primary-500" onClick={closeMenu}>
                Lesson Plans
              </Link>
              
              <Link href="/pricing" className="py-2 text-gray-800 hover:text-primary-500" onClick={closeMenu}>
                Pricing
              </Link>
              
              <Link href="/blog" className="py-2 text-gray-800 hover:text-primary-500" onClick={closeMenu}>
                Blog
              </Link>
              
              <Link href="/about" className="py-2 text-gray-800 hover:text-primary-500" onClick={closeMenu}>
                About
              </Link>
              
              <div className="pt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  <Link 
                    href="/dashboard" 
                    className="flex items-center py-2 text-gray-800 hover:text-primary-500"
                    onClick={closeMenu}
                  >
                    <FiUser className="mr-2" />
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href="/sign-in" 
                      className="py-2 text-gray-800 hover:text-primary-500"
                      onClick={closeMenu}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/sign-up" 
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-center font-medium"
                      onClick={closeMenu}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
