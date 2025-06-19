"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { FiMenu, FiX, FiChevronDown } from 'react-icons/fi'
import { Button } from './ui/Button'
import { Logo } from './Logo'

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
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/videos" className="text-gray-700 hover:text-primary-600 transition-colors">
              Videos
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
              <Link href="/videos" className="text-gray-700 hover:text-primary-600 transition-colors">
                Videos
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
