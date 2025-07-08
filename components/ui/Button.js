"use client"

import React from 'react'
import Link from 'next/link'
import { cva, VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-600',
        outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-600',
        ghost: 'text-primary-600 hover:bg-primary-50 hover:text-primary-700 focus-visible:ring-primary-600',
        light: 'bg-white text-primary-700 hover:bg-gray-100 focus-visible:ring-primary-600',
        dark: 'bg-gray-800 text-white hover:bg-gray-700 focus-visible:ring-gray-800',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ href, variant, size, fullWidth, className, ...props }, ref) => {
    if (href) {
      return (
        <Link
          href={href}
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        >
          {props.children}
        </Link>
      )
    }
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
