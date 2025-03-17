'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FiMenu, FiX } from 'react-icons/fi'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Videos', href: '/videos' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Merchandise', href: '/merchandise' },
    { name: 'Travel', href: '/travel' },
    { name: 'About', href: '/about' },
  ]
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Yoga for PE</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary-700 ${
                      pathname === item.href ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signin" className="text-sm font-medium text-gray-700 hover:text-primary-600">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary py-2 px-4">
              Sign Up
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-primary-600"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 pt-2 pb-3 space-y-1 sm:px-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-2 text-base font-medium ${
                  pathname === item.href ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                }`}
                onClick={toggleMenu}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-gray-200 flex flex-col space-y-3">
              <Link 
                href="/signin" 
                className="block text-center py-2 text-base font-medium text-gray-700 hover:text-primary-600"
                onClick={toggleMenu}
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="btn btn-primary py-2"
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
