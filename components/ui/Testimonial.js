import React from 'react'
import { cn } from '../../lib/utils'



export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating,
  className,
  variant = 'default',
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg p-6 shadow-md',
        variant === 'compact' && 'p-4',
        variant === 'featured' && 'p-8 shadow-lg border-l-4 border-primary-500',
        className
      )}
      {...props}
    >
      {/* Quote mark */}
      <div className="mb-4 text-primary-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn(
            variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8',
            variant === 'featured' && 'w-10 h-10 text-primary-500/80'
          )}
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Stars */}
      {rating && (
        <div className="flex mb-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={cn(
                "w-4 h-4 mr-1",
                i < rating ? "text-yellow-400 fill-current" : "text-gray-300 fill-current"
              )}
              viewBox="0 0 24 24"
            >
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
            </svg>
          ))}
        </div>
      )}

      {/* Quote text */}
      <p className={cn(
        'text-gray-700 mb-4',
        variant === 'compact' && 'text-sm',
        variant === 'featured' && 'text-lg'
      )}>
        {quote}
      </p>

      {/* Author info */}
      <div className="flex items-center">
        {avatar && (
          <div className={cn(
            'rounded-full overflow-hidden bg-gray-200 mr-3 flex-shrink-0',
            variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10',
            variant === 'featured' && 'w-12 h-12'
          )}>
            <img
              src={avatar}
              alt={`${author}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <p className={cn(
            'font-medium text-gray-900',
            variant === 'compact' && 'text-sm',
            variant === 'featured' && 'text-lg'
          )}>
            {author}
          </p>
          {role && (
            <p className={cn(
              'text-gray-500',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {role}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * @typedef {Object} TestimonialGridProps
 * @property {number} [columns=3] - Number of columns (1-4)
 * @property {string} [className] - Additional CSS classes
 */

export function TestimonialGrid({
  testimonials,
  columns = 3,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
      {...props}
    >
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          quote={testimonial.quote}
          author={testimonial.author}
          role={testimonial.role}
          avatar={testimonial.avatar}
          rating={testimonial.rating}
        />
      ))}
    </div>
  )
}
