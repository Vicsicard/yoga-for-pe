'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider({
  title = "Yoga for Physical Education",
  subtitle = "Enhance your PE curriculum with mindfulness and movement",
  description,
  buttonText = "Get Started",
  buttonUrl = "/videos",
  secondaryButtonText,
  secondaryButtonUrl,
  overlayOpacity = "medium", // light, medium, dark
  imagePosition = "center", // top, center, bottom
  height = "lg", // sm, md, lg, xl, full
  roundedCorners = true,
  sliderInterval = 5000,
  pageType = "home",
}) {
  // Height classes
  const heightClasses = {
    sm: "h-[300px]",
    md: "h-[400px]",
    lg: "h-[500px]",
    xl: "h-[600px]",
    full: "h-screen",
  };

  // Default slider images for home page
  const homeSliderImages = [
    {
      src: "/images/hero/yoga-class-1.jpg",
      alt: "Students practicing yoga in a gym",
    },
    {
      src: "/images/hero/yoga-class-2.jpg",
      alt: "Teacher leading a yoga session",
    },
    {
      src: "/images/hero/mindfulness-1.jpg",
      alt: "Students in a mindfulness exercise",
    },
  ];

  // Slider images for contact page
  const contactSliderImages = [
    {
      src: "/images/hero/contact-1.jpg",
      alt: "Our team helping customers",
    },
    {
      src: "/images/hero/contact-2.jpg",
      alt: "Yoga for PE headquarters",
    },
  ];

  // Slider images for about page
  const aboutSliderImages = [
    {
      src: "/images/hero/about-1.jpg",
      alt: "Our mission in action",
    },
    {
      src: "/images/hero/about-2.jpg",
      alt: "The Yoga for PE team",
    },
  ];

  // Current slide index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determine which image set to use based on pageType
  const sliderImages = pageType === 'contact' ? contactSliderImages : 
                       pageType === 'about' ? aboutSliderImages :
                       homeSliderImages;

  const overlayClasses = {
    light: 'bg-black/30',
    medium: 'bg-black/50',
    dark: 'bg-black/70'
  };

  // Auto advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1
      );
    }, sliderInterval);
    
    return () => clearInterval(interval);
  }, [sliderImages.length, sliderInterval]);

  return (
    <div 
      className={`relative w-full ${heightClasses[height]} overflow-hidden ${
        roundedCorners ? "rounded-2xl" : ""
      }`}
    >
      {/* Slider images */}
      {sliderImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.src || "/images/hero/default-hero.jpg"}
            alt={image.alt || "Yoga for PE"}
            fill
            priority={index === 0}
            className={`object-cover object-${imagePosition}`}
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlayOpacity] || overlayClasses.medium}`}></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="text-center text-white max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {title}
          </h1>
          
          <p className="text-xl md:text-2xl mb-6 font-light">
            {subtitle}
          </p>
          
          {description && (
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              {description}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {buttonText && (
              <Link
                href={buttonUrl}
                className="bg-primary-500 hover:bg-primary-600 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
              >
                {buttonText}
              </Link>
            )}
            
            {secondaryButtonText && (
              <Link
                href={secondaryButtonUrl || "#"}
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-8 rounded-lg font-semibold backdrop-blur-sm transition-colors"
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Slider dots navigation */}
      <div className="absolute bottom-6 left-0 right-0">
        <div className="flex justify-center gap-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
