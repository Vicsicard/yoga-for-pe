"use client"

import React, { useState, useEffect } from "react"
import { cn } from "../../lib/utils"
import { Container } from "./Container"
import { Button } from "./Button"

// Define the image paths for the slider
const sliderImages = [
  '/slider-images/Beach Yoga.png',
  '/slider-images/Believe.png',
  '/slider-images/Human Yoga.png',
  '/slider-images/India Hands.png',
  '/slider-images/Jumping.png',
  '/slider-images/3 leg Downdog.png',
  '/slider-images/Mandala Star.png',
  '/slider-images/V Teaching at SHAPE.png',
  '/slider-images/Bubbles.png'
]

interface HeroSliderProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
  title: string
  subtitle?: string
  description?: string
  align?: "left" | "center" | "right"
  overlayOpacity?: "light" | "medium" | "dark"
  size?: "sm" | "md" | "lg"
  transitionInterval?: number // Time in ms between slides
  buttons?: {
    primary?: {
      text: string
      href: string
    }
    secondary?: {
      text: string
      href: string
    }
  }
}

export function HeroSlider({
  className,
  title,
  subtitle,
  description,
  align = "left",
  overlayOpacity = "medium",
  size = "md",
  transitionInterval = 5000, // Default to 5 seconds
  buttons,
  ...props
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Handle automatic image transitions
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1
      )
    }, transitionInterval)

    return () => clearInterval(intervalId)
  }, [transitionInterval])

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        size === "sm" && "py-12",
        size === "md" && "py-16 md:py-24",
        size === "lg" && "py-24 md:py-32",
        className
      )}
      {...props}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${sliderImages[currentIndex]})`,
          transition: "background-image 0.5s ease-in-out"
        }}
      />
      
      {/* Overlay */}
      <div 
        className={cn(
          "absolute inset-0",
          overlayOpacity === "medium" && "bg-black/50",
          overlayOpacity === "light" && "bg-black/30",
          overlayOpacity === "dark" && "bg-black/70"
        )}
      />

      {/* Content */}
      <Container className="relative z-10">
        <div 
          className={cn(
            "max-w-3xl",
            align === "center" && "mx-auto text-center",
            align === "right" && "ml-auto text-right",
            "text-white"
          )}
        >
          {subtitle && (
            <p className="text-sm uppercase tracking-wider font-medium mb-2 text-white/90">
              {subtitle}
            </p>
          )}
          
          <h1 className={cn(
            "font-bold",
            size === "sm" && "text-3xl md:text-4xl",
            size === "md" && "text-4xl md:text-5xl",
            size === "lg" && "text-5xl md:text-6xl",
          )}>
            {title}
          </h1>
          
          {description && (
            <p className={cn(
              "mt-4",
              size === "sm" && "text-base",
              size === "md" && "text-lg",
              size === "lg" && "text-xl",
              "text-white/80"
            )}>
              {description}
            </p>
          )}
          
          {buttons && (
            <div className={cn(
              "mt-8 flex flex-wrap gap-4",
              align === "center" && "justify-center",
              align === "right" && "justify-end"
            )}>
              {buttons.primary && (
                <Button href={buttons.primary.href}>
                  {buttons.primary.text}
                </Button>
              )}
              
              {buttons.secondary && (
                <Button 
                  href={buttons.secondary.href} 
                  variant="light"
                >
                  {buttons.secondary.text}
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
