import React from "react"
import { cn } from "../../lib/utils"
import { Container } from "./Container"
import { Button } from "./Button"


    secondary?: {
      text: string, href: string
    }
  }
}

export function Hero({
  className,
  title,
  subtitle,
  description,
  align = "left",
  backgroundImage,
  backgroundOverlay = true,
  overlayOpacity = "medium",
  size = "md",
  buttons,
  ...props
}) {
  return (
    <section
      className={cn(
        "relative",
        size === "sm" && "py-12",
        size === "md" && "py-16 md:py-24",
        size === "lg" && "py-24 md:py-32",
        className
      )}
      {...props}
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center z-0" 
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          
          {/* Overlay */}
          {backgroundOverlay && (
            <div 
              className={cn(
                "absolute inset-0 z-0",
                !overlayOpacity || overlayOpacity === "medium" && "bg-black/50",
                overlayOpacity === "light" && "bg-black/30",
                overlayOpacity === "dark" && "bg-black/70"
              )}
            />
          )}
        </>
      )}

      {/* Content */}
      <Container className="relative z-10">
        <div 
          className={cn(
            "max-w-3xl",
            align === "center" && "mx-auto text-center",
            align === "right" && "ml-auto text-right",
            backgroundImage && "text-white"
          )}
        >
          {subtitle && (
            <p className={cn(
              "text-sm uppercase tracking-wider font-medium mb-2",
              backgroundImage ? "text-white/90" : "text-primary-600"
            )}>
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
              backgroundImage ? "text-white/80" : "text-gray-600"
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
                  variant={backgroundImage ? "light" : "outline"}
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
