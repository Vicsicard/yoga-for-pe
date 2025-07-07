'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function ProductSpotlight() {
  const [mainImage, setMainImage] = useState('/images/curriculum-main.jpg')
  
  // Thumbnail images - you'll need to add actual images to the public/images directory
  const thumbnails = [
    '/images/curriculum-thumb1.jpg',
    '/images/curriculum-thumb2.jpg',
    '/images/curriculum-thumb3.jpg'
  ]
  
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Product Gallery */}
          <div className="order-2 md:order-1">
            <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-primary-500 to-secondary-500">
              <div className="flex items-center justify-center w-full h-64 text-white">
                <span className="text-xl font-medium">Curriculum Preview Image
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              {thumbnails.map((thumb, index) => (
                <button 
                  key={index} 
                  className="w-16 h-16 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-200 flex items-center justify-center"
                  onClick={() => setMainImage(thumb)}
                >
                  <span className="text-xs text-gray-600">Thumb: {index + 1}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="order-1 md:order-2">
            <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm mb-4">
              YPE254
            </span>
            
            <h2 className="text-3xl font-bold mb-4">Comprehensive Yoga Curriculum
            
            <div className="flex items-center mb-6">
              <span className="text-2xl font-bold text-primary-600 mr-3">$165.00
              <span className="text-gray-500 line-through">$200.00
            </div>
            
            <p className="text-gray-700 mb-6">
              A complete curriculum designed specifically for physical education teachers to integrate yoga into their classes. Includes detailed lesson plans, instructional videos, and assessment tools.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <span className="block text-xs text-gray-500 mb-1">Duration
                <span className="font-semibold">16 weeks
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <span className="block text-xs text-gray-500 mb-1">Age Range
                <span className="font-semibold">8-18 years
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <span className="block text-xs text-gray-500 mb-1">Resources
                <span className="font-semibold">Digital + Print
              </div>
            </div>
            
            <button className="btn btn-primary w-full mb-4">
              Add to Cart
            </button>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What's Included:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>16-week progressive curriculum
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>45 instructional videos
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>Printable pose guides and worksheets
                </li>
                <li className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>Assessment tools and rubrics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
