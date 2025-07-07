import React from 'react'
import { cn } from '../../lib/utils'



export function Feature({
  title,
  description,
  icon,
  className,
  iconClassName,
  ...props
}) {
  return (
    <div className={cn('', className)} {...props}>
      {icon && (
        <div className={cn(
          'w-12 h-12 flex items-center justify-center rounded-lg bg-primary-100 text-primary-600 mb-4',
          iconClassName
        )}>
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

>
  columns?: 1 | 2 | 3 | 4
  className?: string
  variant?: 'default' | 'cards' | 'minimal'
}

export function FeatureGrid({
  features,
  columns = 3,
  className,
  variant = 'default',
  ...props
}) {
  return (
    <div
      className={cn(
        'grid gap-8',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
      {...props}
    >
      {features.map((feature) => (
        <Feature
          key={feature.id}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          className={cn(
            variant === 'cards' && 'bg-white rounded-lg p-6 shadow-md',
            variant === 'minimal' && 'flex items-start',
          )}
          iconClassName={cn(
            variant === 'minimal' && 'w-10 h-10 mr-4 mb-0',
          )}
        />
      ))}
    </div>
  )
}

>
  imageSrc: string, imageAlt: string
  imagePosition?: 'left' | 'right'
  className?: string
}

export function FeatureWithImage({
  title,
  description,
  features,
  imageSrc,
  imageAlt,
  imagePosition = 'right',
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'lg:grid gap-12 items-center',
        imagePosition === 'right' ? 'lg:grid-cols-[1fr,auto]' : 'lg:grid-cols-[auto,1fr]',
        className
      )}
      {...props}
    >
      <div className={cn(
        'mb-10 lg:mb-0',
        imagePosition === 'left' && 'lg:order-2'
      )}>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-xl text-gray-600 mb-8">{description}</p>

        <div className="space-y-6">
          {features.map((feature) => (
            <div key={feature.id} className="flex">
              {feature.icon && (
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary-100 text-primary-600 mr-4">
                  {feature.icon}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(
        'w-full lg:w-[500px] h-[400px] bg-gray-200 rounded-lg overflow-hidden',
        imagePosition === 'left' && 'lg:order-1'
      )}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {imageAlt || 'Feature Image'}
          </div>
        )}
      </div>
    </div>
  )
}
