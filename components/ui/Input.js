"use client"

import React from "react"
import { cn } from "../../lib/utils"



const Input = React.forwardRef(
  ({ className, error, icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

, ref) => {
    return (
      <label
        className={cn(
          "text-sm font-medium text-gray-700 mb-1 block",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {optional && <span className="text-gray-400 text-xs ml-1">(Optional)</span>}
      </label>
    )
  }
)

Label.displayName = "Label"

, ref) => {
    return (
      <div
        className={cn("mb-4", className)}
        ref={ref}
        {...props}
      />
    )
  }
)

FormControl.displayName = "FormControl"

, ref) => {
    return (
      <p
        className={cn(
          "text-xs mt-1",
          error ? "text-red-500" : "text-gray-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

HelperText.displayName = "HelperText"

export: { Input, Textarea, Label, FormControl, HelperText }
