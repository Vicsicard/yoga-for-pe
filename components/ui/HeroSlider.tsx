"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const sliderImages = [
  {
    src: '/slider-images/Beach Yoga.png',
    alt: 'Beach Yoga',
  },
  {
    src: '/slider-images/Believe.png',
    alt: 'Believe',
  },
  {
    src: '/slider-images/Bubbles.png',
    alt: 'Bubbles',
  },
  {
    src: '/slider-images/Human Yoga.png',
    alt: 'Human Yoga',
  },
  {
    src: '/slider-images/India Hands.png',
    alt: 'India Hands',
  },
  {
    src: '/slider-images/Jumping.png',
    alt: 'Jumping',
  },
  {
    src: '/slider-images/Mandala Star.png',
    alt: 'Mandala Star',
  },
  {
    src: '/slider-images/V Teaching at SHAPE.png',
    alt: 'V Teaching at SHAPE',
  }
]

const contactSliderImages = [
  {
    src: '/slider-images/contact slider/Believe.JPG',
    alt: 'Believe',
  },
  {
    src: '/slider-images/contact slider/IMG_3042.JPG',
    alt: 'Yoga Practice',
  },
  {
    src: '/slider-images/contact slider/IMG_7532.jpeg',
    alt: 'Yoga Session',
  },
  {
    src: '/slider-images/contact slider/PE Institute Ashville 2017.JPG',
    alt: 'PE Institute Ashville 2017',
  },
  {
    src: '/slider-images/contact slider/SHAPE America Boston 2017.png',
    alt: 'SHAPE America Boston 2017',
  }
]

interface HeroSliderProps {
  overlayOpacity?: 'light' | 'medium' | 'dark'
  autoplayInterval?: number
  showControls?: boolean
  showOverlay?: boolean
  height?: string
  children?: React.ReactNode
  imageSet?: 'default' | 'contact'
}

export function HeroSlider({
  overlayOpacity = 'medium',
  autoplayInterval = 5000,
  showControls = true,
  showOverlay = true,
  height = 'h-96 md:h-[500px] lg:h-[600px]',
  children,
  imageSet = 'default'
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const overlayClasses = {
    light: 'bg-black/30',
    medium: 'bg-black/50',
    dark: 'bg-black/70'
  }
  
  // Select the appropriate image set
  const images = imageSet === 'contact' ? contactSliderImages : sliderImages

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplayInterval, images.length])

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      {/* Slider Images */}
      {images.map((image, index) => (
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
        {images.map((_, index) => (
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
