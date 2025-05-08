"use client"

import React from "react"
import { cn } from "../../lib/utils"
import { Container } from "./Container"
import { Button } from "./Button"

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
      {/* Hero Slider with CSS Animation */}
      <div className="hero-slider absolute inset-0 w-full h-full">
        <div className="slides">
          <div className="slide" style={{ backgroundImage: "url('/slider-images/Beach Yoga.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/Believe.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/Human Yoga.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/India Hands.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/Jumping.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/3 leg Downdog.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/Mandala Star.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/V Teaching at SHAPE.png')" }}></div>
          <div className="slide" style={{ backgroundImage: "url('/slider-images/Bubbles.png')" }}></div>
        </div>
      </div>
      
      {/* Overlay */}
      <div 
        className={cn(
          "absolute inset-0 z-10",
          overlayOpacity === "medium" && "bg-black/50",
          overlayOpacity === "light" && "bg-black/30",
          overlayOpacity === "dark" && "bg-black/70"
        )}
      />

      {/* Content */}
      <Container className="relative z-20">
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

      {/* CSS for the slider animation */}
      <style jsx>{`
        .hero-slider {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .slides {
          position: absolute;
          width: 900%;
          height: 100%;
          display: flex;
          animation: slideshow 45s linear infinite;
        }
        
        .slide {
          width: 11.11%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }
        
        @keyframes slideshow {
          0% { transform: translateX(0); }
          11.11% { transform: translateX(0); }
          12.5% { transform: translateX(-11.11%); }
          22.22% { transform: translateX(-11.11%); }
          23.61% { transform: translateX(-22.22%); }
          33.33% { transform: translateX(-22.22%); }
          34.72% { transform: translateX(-33.33%); }
          44.44% { transform: translateX(-33.33%); }
          45.83% { transform: translateX(-44.44%); }
          55.55% { transform: translateX(-44.44%); }
          56.94% { transform: translateX(-55.55%); }
          66.66% { transform: translateX(-55.55%); }
          68.05% { transform: translateX(-66.66%); }
          77.77% { transform: translateX(-66.66%); }
          79.16% { transform: translateX(-77.77%); }
          88.88% { transform: translateX(-77.77%); }
          90.27% { transform: translateX(-88.88%); }
          100% { transform: translateX(-88.88%); }
        }
      `}</style>
    </section>
  )
}
