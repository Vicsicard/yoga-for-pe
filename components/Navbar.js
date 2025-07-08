"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi'
import { Button } from './ui/Button'
import Logo from './Logo'
import { useAuth } from '../lib/hooks/useAuth'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  
  // Use try/catch to handle potential auth provider issues
  let user = null;
  let isAuthenticated = false;
  let logout = async () => {};
  
  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = auth.isAuthenticated;
    logout = auth.logout;
  } catch (error) {
    console.error('Auth context not available:', error);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null)
    } else: {
      setActiveDropdown(dropdown)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-24 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/videos" className="text-gray-700 hover:text-primary-600 transition-colors">
              Videos
            </Link>
            <Link href="/guest-speaking" className="text-gray-700 hover:text-primary-600 transition-colors">
              Guest Speaking & Consult
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="relative group">
                <button 
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <span className="mr-1">{user?.name || 'Account'}</span>
                  <FiChevronDown className="h-4 w-4" />
                </button>
                
                {activeDropdown === 'user' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FiUser className="inline mr-2" /> My Account
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="inline mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/sign-in" className="inline-block">
                  <Button variant="outline" className="mr-2">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" className="inline-block">
                  <Button>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/videos" className="text-gray-700 hover:text-primary-600 transition-colors">
                Videos
              </Link>
              <Link href="/guest-speaking" className="text-gray-700 hover:text-primary-600 transition-colors">
                Guest Speaking & Consult
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </Link>
              
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/account" className="flex items-center text-gray-700 py-2">
                      <FiUser className="mr-2" /> My Account
                    </Link>
                    <button 
                      onClick={() => logout()}
                      className="flex items-center text-gray-700 py-2"
                    >
                      <FiLogOut className="mr-2" /> Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Button href="/sign-in" variant="outline" fullWidth>
                      Sign In
                    </Button>
                    <Button href="/sign-up" fullWidth>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
