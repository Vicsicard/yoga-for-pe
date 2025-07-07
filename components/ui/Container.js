import { cn } from "../../lib/utils"



export function Container({
  className,
  size = "default",
  ...props
}) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6",
        size === "default" && "max-w-6xl",
        size === "sm" && "max-w-4xl",
        size === "lg" && "max-w-7xl",
        size === "xl" && "max-w-screen-2xl",
        size === "full" && "max-w-none",
        className
      )}
      {...props}
    />
  )
}
