"use client"

import { cn } from "../../lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  shadow?: "none" | "sm" | "md" | "lg"
  hover?: boolean
}

export function Card({
  className,
  shadow = "md", 
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-white overflow-hidden",
        shadow === "none" && "shadow-none",
        shadow === "sm" && "shadow-sm",
        shadow === "md" && "shadow-md",
        shadow === "lg" && "shadow-lg",
        hover && "transition-transform duration-300 hover:translate-y-[-4px]",
        className
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function CardHeader({
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("p-6 pb-0", className)}
      {...props}
    />
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

export function CardTitle({
  className,
  as = "h3",
  ...props
}: CardTitleProps) {
  const Component = as
  return (
    <Component
      className={cn(
        "font-bold text-xl mb-2",
        className
      )}
      {...props}
    />
  )
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

export function CardDescription({
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn("text-gray-600 text-sm", className)}
      {...props}
    />
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function CardContent({
  className,
  ...props
}: CardContentProps) {
  return (
    <div
      className={cn("p-6", className)}
      {...props}
    />
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function CardFooter({
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn("p-6 pt-0 mt-auto", className)}
      {...props}
    />
  )
}

interface CardImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'children'> {
  className?: string
  aspectRatio?: "auto" | "square" | "video" | "vertical"
  overlay?: boolean
  children?: React.ReactNode
}

export function CardImage({
  className,
  aspectRatio = "auto",
  overlay = false,
  children,
  ...props
}: CardImageProps) {
  return (
    <div className={cn(
      aspectRatio === "square" && "aspect-square",
      aspectRatio === "video" && "aspect-video",
      aspectRatio === "vertical" && "aspect-[2/3]",
      "relative overflow-hidden bg-gray-200",
      className
    )}>
      {children ? (
        children
      ) : (
        <img
          className="object-cover w-full h-full"
          {...props}
        />
      )}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      )}
    </div>
  )
}
