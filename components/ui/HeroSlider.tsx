"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Home page slider images
const homeSliderImages = [
  {
    src: '/slider-images/home/Student Teach 3 DD.jpeg',
    alt: 'Student Teaching',
  },
  {
    src: '/slider-images/home/Mandala Star Taylor.JPG',
    alt: 'Mandala Star',
  },
  {
    src: '/slider-images/home/India Hands 2007 (189).JPG',
    alt: 'India Hands',
  },
  {
    src: '/slider-images/home/Human Yoga Spelled out copy.jpeg',
    alt: 'Human Yoga Spelled Out',
  },
  {
    src: '/slider-images/home/bubble classroom .JPG',
    alt: 'Bubble Classroom',
  },
  {
    src: '/slider-images/home/Believe copy.jpeg',
    alt: 'Believe',
  },
  {
    src: '/slider-images/home/Beach Yoga Anabel & Emily.jpg',
    alt: 'Beach Yoga',
  }
]

// Contact page slider images
const contactSliderImages = [
  {
    src: '/slider-images/contact/Focus & Concentration.jpeg',
    alt: 'Focus and Concentration',
  },
  {
    src: '/slider-images/contact/Physical Fitness.jpeg',
    alt: 'Physical Fitness',
  },
  {
    src: '/slider-images/contact/Pic 1 Y4PE & Everybody.jpeg',
    alt: 'Yoga for PE and Everybody',
  },
  {
    src: '/slider-images/contact/Pic 3 Meditation Cecil.JPG',
    alt: 'Meditation Cecil',
  },
  {
    src: '/slider-images/contact/Stress & Anxiety 2.JPG',
    alt: 'Stress and Anxiety Reduction',
  }
]

interface HeroSliderProps {
  overlayOpacity?: 'light' | 'medium' | 'dark'
  autoplayInterval?: number
  showControls?: boolean
  showOverlay?: boolean
  height?: string
  children?: React.ReactNode
  pageType?: 'home' | 'contact'  // New prop to determine which image set to use
}

export function HeroSlider({
  overlayOpacity = 'medium',
  autoplayInterval = 5000,
  showControls = true,
  pageType = 'home',  // Default to home page images
  showOverlay = true,
  height = 'h-96 md:h-[500px] lg:h-[600px]',
  children
}: HeroSliderProps) {
  // Determine which image set to use based on pageType
  const sliderImages = pageType === 'contact' ? contactSliderImages : homeSliderImages

  const [currentSlide, setCurrentSlide] = useState(0)
  
  const overlayClasses = {
    light: 'bg-black/30',
    medium: 'bg-black/50',
    dark: 'bg-black/70'
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplayInterval])

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      {/* Slider Images */}
      {sliderImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              style={{ objectFit: 'cover' }}
              priority={index === 0}
            />
            {showOverlay && (
              <div
                className={`absolute inset-0 ${overlayClasses[overlayOpacity]}`}
              ></div>
            )}
          </div>
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-4">
        {children}
      </div>

      {/* Controls */}
      {showControls && (
        <>
          <button
            className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none transition-colors"
            onClick={goToPrevSlide}
            aria-label="Previous slide"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none transition-colors"
            onClick={goToNextSlide}
            aria-label="Next slide"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full focus:outline-none transition-colors ${
              index === currentSlide
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  )
}

export function HeroSliderContent({ 
  children, 
  className = '',
  maxWidth = 'max-w-4xl'
}: { 
  children: React.ReactNode
  className?: string
  maxWidth?: string
}) {
  return (
    <div className={`text-center ${maxWidth} mx-auto ${className}`}>
      {children}
    </div>
  )
}
