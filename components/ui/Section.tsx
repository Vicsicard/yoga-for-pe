import { cn } from "../../lib/utils"
import { Container } from "./Container"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string
  bgColor?: "white" | "light" | "primary" | "secondary" | "dark"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  container?: boolean
  containerSize?: "default" | "sm" | "lg" | "xl" | "full"
}

export function Section({
  className,
  bgColor = "white",
  spacing = "lg",
  container = true,
  containerSize = "default",
  children,
  ...props
}: SectionProps) {
  const content = container ? (
    <Container size={containerSize}>
      {children}
    </Container>
  ) : (
    children
  )

  return (
    <section
      className={cn(
        // Background colors
        bgColor === "white" && "bg-white",
        bgColor === "light" && "bg-gray-50",
        bgColor === "primary" && "bg-primary-50",
        bgColor === "secondary" && "bg-secondary-50",
        bgColor === "dark" && "bg-gray-900 text-white",
        
        // Spacing
        spacing === "none" && "py-0",
        spacing === "sm" && "py-8",
        spacing === "md" && "py-12",
        spacing === "lg" && "py-16",
        spacing === "xl" && "py-24",
        
        className
      )}
      {...props}
    >
      {content}
    </section>
  )
}

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  title: string
  description?: string
  align?: "left" | "center" | "right"
  titleSize?: "default" | "sm" | "lg" | "xl"
}

export function SectionHeader({
  className,
  title,
  description,
  align = "left",
  titleSize = "default",
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    >
      <h2 className={cn(
        "font-bold",
        titleSize === "default" && "text-2xl md:text-3xl",
        titleSize === "sm" && "text-xl md:text-2xl",
        titleSize === "lg" && "text-3xl md:text-4xl",
        titleSize === "xl" && "text-4xl md:text-5xl",
      )}>
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
