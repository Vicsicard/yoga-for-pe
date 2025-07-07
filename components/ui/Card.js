"use client"

import { cn } from "../../lib/utils"



export function Card({
  className,
  shadow = "md", 
  hover = false,
  ...props
}) {
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



export function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      className={cn("p-6 pb-0", className)}
      {...props}
    />
  )
}



export function CardTitle({
  className,
  as = "h3",
  ...props
}) {
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



export function CardDescription({
  className,
  ...props
}) {
  return (
    <p
      className={cn("text-gray-600 text-sm", className)}
      {...props}
    />
  )
}



export function CardContent({
  className,
  ...props
}) {
  return (
    <div
      className={cn("p-6", className)}
      {...props}
    />
  )
}



export function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      className={cn("p-6 pt-0 mt-auto", className)}
      {...props}
    />
  )
}



export function CardImage({
  className,
  aspectRatio = "auto",
  overlay = false,
  children,
  ...props
}) {
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
