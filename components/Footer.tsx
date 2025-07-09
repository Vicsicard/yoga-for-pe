"use client"

import Link from 'next/link'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'
import { useState } from 'react'
import { LiabilityWaiverModal } from './LiabilityWaiverModal'

export function Footer() {
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false)

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Yoga for PE</h2>
            <p className="text-gray-400 mb-4">Transforming physical education through yoga practice to enhance flexibility, focus, and well-being in schools.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaYoutube size={20} />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-400 hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Footer Spacer */}
          <div></div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@yogaforpe.com</li>
              <li>Phone: 720.514.9820</li>
              <li>
                <Link href="/contact" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Send us a message
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Yoga for PE. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <button 
              onClick={() => setIsWaiverModalOpen(true)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Liability Waiver
            </button>
          </div>
        </div>
      </div>
      
      <LiabilityWaiverModal 
        isOpen={isWaiverModalOpen} 
        onClose={() => setIsWaiverModalOpen(false)} 
      />
    </footer>
  )
}
