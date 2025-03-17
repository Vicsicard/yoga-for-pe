"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi'
import { Button } from './ui/Button'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = (dropdown: string) => {
    if (activeDropdown === dropdown) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(dropdown)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Yoga for PE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button 
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => toggleDropdown('programs')}
              >
                Programs <FiChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <Link href="/programs/elementary" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Elementary School
                </Link>
                <Link href="/programs/middle-school" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Middle School
                </Link>
                <Link href="/programs/high-school" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  High School
                </Link>
              </div>
            </div>
            <Link href="/videos" className="text-gray-700 hover:text-primary-600 transition-colors">
              Videos
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
              Blog
            </Link>
            <Link href="/travel" className="text-gray-700 hover:text-primary-600 transition-colors">
              Travel
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-primary-600 transition-colors">
              Shop
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Sign In/Sign Up buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button href="/login" variant="outline" size="sm">
              Sign In
            </Button>
            <Button href="/signup" size="sm">
              Sign Up
            </Button>
          </div>

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
              <div>
                <button 
                  className="flex items-center justify-between w-full text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => toggleDropdown('programs-mobile')}
                >
                  Programs 
                  <FiChevronDown className={`ml-1 h-4 w-4 transition-transform ${activeDropdown === 'programs-mobile' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'programs-mobile' && (
                  <div className="mt-2 pl-4 space-y-2">
                    <Link href="/programs/elementary" className="block text-gray-700 hover:text-primary-600">
                      Elementary School
                    </Link>
                    <Link href="/programs/middle-school" className="block text-gray-700 hover:text-primary-600">
                      Middle School
                    </Link>
                    <Link href="/programs/high-school" className="block text-gray-700 hover:text-primary-600">
                      High School
                    </Link>
                  </div>
                )}
              </div>
              <Link href="/videos" className="text-gray-700 hover:text-primary-600 transition-colors">
                Videos
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-primary-600 transition-colors">
                Blog
              </Link>
              <Link href="/travel" className="text-gray-700 hover:text-primary-600 transition-colors">
                Travel
              </Link>
              <Link href="/shop" className="text-gray-700 hover:text-primary-600 transition-colors">
                Shop
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition-colors">
                Contact
              </Link>
              
              <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
                <Button href="/login" variant="outline" fullWidth>
                  Sign In
                </Button>
                <Button href="/signup" fullWidth>
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
