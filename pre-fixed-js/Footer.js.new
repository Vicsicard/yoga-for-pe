'use client';

import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Social */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Yoga for PE</h2>
            <p className="mb-4">Bringing mindfulness and movement to physical education.</p>
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
            <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/videos" className="hover:text-white transition-colors">Videos</Link></li>
              <li><Link href="/blogs" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Resources</h2>
            <ul className="space-y-2">
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
              <li><Link href="/guest-speaking" className="hover:text-white transition-colors">Guest Speaking</Link></li>
              <li><Link href="/travel" className="hover:text-white transition-colors">Travel</Link></li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Legal</h2>
            <ul className="space-y-2">
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p>&copy; {currentYear} Yoga for PE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
