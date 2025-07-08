'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider(props) {
  // Extract props with default values
  const title = props.title || "Yoga for Physical Education";
  const subtitle = props.subtitle || "Enhance your PE curriculum with mindfulness and movement";
  const description = props.description;
  const buttonText = props.buttonText || "Get Started";
  const buttonUrl = props.buttonUrl || "/videos";
  const secondaryButtonText = props.secondaryButtonText;
  const secondaryButtonUrl = props.secondaryButtonUrl;
  const overlayOpacity = props.overlayOpacity || "medium";
  const imagePosition = props.imagePosition || "center";
  const height = props.height || "lg";
  const roundedCorners = props.roundedCorners !== false;
  const sliderInterval = props.sliderInterval || 5000;
  const pageType = props.pageType || "home";

  // Height classes
  const heightClasses = {
    sm: "h-[300px]",
    md: "h-[400px]",
    lg: "h-[500px]",
    xl: "h-[600px]",
    full: "h-screen"
  };

  // Default slider images for home page
  const homeSliderImages = [
    {
      src: "/images/hero/yoga-class-1.jpg",
      alt: "Students practicing yoga in a gym"
    },
    {
      src: "/images/hero/yoga-class-2.jpg",
      alt: "Teacher leading a yoga session"
    },
    {
      src: "/images/hero/mindfulness-1.jpg",
      alt: "Students in a mindfulness exercise"
    }
  ];

  // Slider images for contact page
  const contactSliderImages = [
    {
      src: "/images/hero/contact-1.jpg",
      alt: "Our team helping customers"
    },
    {
      src: "/images/hero/contact-2.jpg",
      alt: "Yoga for PE headquarters"
    }
  ];

  // Slider images for about page
  const aboutSliderImages = [
    {
      src: "/images/hero/about-1.jpg",
      alt: "Our mission in action"
    },
    {
      src: "/images/hero/about-2.jpg",
      alt: "The Yoga for PE team"
    }
  ];

  // Current slide index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Helper function to get image position class
  function getPositionClass(position) {
    if (position === "top") {
      return "object-cover object-top";
    } else if (position === "bottom") {
      return "object-cover object-bottom";
    } else {
      return "object-cover object-center";
    }
  }

  // Determine which image set to use based on pageType
  let sliderImages;
  if (pageType === 'contact') {
    sliderImages = contactSliderImages;
  } else if (pageType === 'about') {
    sliderImages = aboutSliderImages;
  } else {
    sliderImages = homeSliderImages;
  }

  const overlayClasses = {
    light: 'bg-black/30',
    medium: 'bg-black/50',
    dark: 'bg-black/70'
  };

  // Auto advance slides
  useEffect(function() {
    const interval = setInterval(function() {
      setCurrentIndex(function(prevIndex) {
        return prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1;
      });
    }, sliderInterval);
    
    return function() { clearInterval(interval); };
  }, [sliderImages.length, sliderInterval]);

  // Generate class strings without template literals
  const containerClasses = ['relative', 'w-full', heightClasses[height], 'overflow-hidden'];
  if (roundedCorners) {
    containerClasses.push('rounded-2xl');
  }

  // Process button rendering
  function renderPrimaryButton() {
    if (buttonText) {
      return (
        <a href={buttonUrl} className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
          {buttonText}
        </a>
      );
    }
    return null;
  }

  function renderSecondaryButton() {
    if (secondaryButtonText && secondaryButtonUrl) {
      return (
        <a href={secondaryButtonUrl} className="bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-300">
          {secondaryButtonText}
        </a>
      );
    }
    return null;
  }

  return (
    <div className={containerClasses.join(' ')}>
      <div className="absolute inset-0">
        {sliderImages.map(function(image, index) {
          return (
            <div
              key={index}
              className={index === currentIndex ? "absolute inset-0 transition-opacity duration-1000 opacity-100" : "absolute inset-0 transition-opacity duration-1000 opacity-0"}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill={true}
                className={getPositionClass(imagePosition)}
                priority={index === 0}
              />
              <div className={"absolute inset-0 " + overlayClasses[overlayOpacity]}></div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 py-12 text-white">
          <div className="max-w-3xl">
            {title ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{title}</h1>
            ) : null}
            
            {subtitle ? (
              <h2 className="text-xl md:text-2xl lg:text-3xl mb-6 text-primary-200">{subtitle}</h2>
            ) : null}
            
            {description ? (
              <p className="text-lg mb-8 max-w-2xl">{description}</p>
            ) : null}
            
            <div className="flex flex-wrap gap-4">
              {renderPrimaryButton()}
              {renderSecondaryButton()}
            </div>
          </div>
        </div>
      </div>

      {sliderImages.length > 1 ? (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {sliderImages.map(function(_, index) {
            return (
              <button
                key={index}
                onClick={function() { setCurrentIndex(index); }}
                className={index === currentIndex ? "w-3 h-3 rounded-full transition-colors bg-primary-500" : "w-3 h-3 rounded-full transition-colors bg-white/50 hover:bg-white/70"}
                aria-label={"Go to slide " + (index + 1)}
              ></button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
