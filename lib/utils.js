import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges Tailwind CSS classes safely
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
