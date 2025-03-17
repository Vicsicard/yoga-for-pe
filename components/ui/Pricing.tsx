"use client"

import React from 'react'
import { cn } from '../../lib/utils'
import { Button } from './Button'

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingTierProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  description?: string
  price: {
    monthly: number
    annually?: number
  }
  features: PricingFeature[]
  cta: {
    text: string
    href: string
  }
  popular?: boolean
  className?: string
  interval?: 'monthly' | 'annually'
  discount?: string
}

export function PricingTier({
  name,
  description,
  price,
  features,
  cta,
  popular,
  className,
  interval = 'monthly',
  discount,
  ...props
}: PricingTierProps) {
  const currentPrice = interval === 'annually' && price.annually 
    ? price.annually 
    : price.monthly
  
  return (
    <div
      className={cn(
        'bg-white rounded-xl overflow-hidden border transition-all',
        popular ? 'border-primary-500 shadow-lg scale-[1.02]' : 'border-gray-200',
        className
      )}
      {...props}
    >
      {popular && (
        <div className="bg-primary-500 text-white py-2 px-4 text-center text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-6">{description}</p>
        )}
        
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${currentPrice}</span>
            <span className="text-gray-500 ml-2">/{interval === 'annually' ? 'year' : 'month'}</span>
          </div>
          {interval === 'annually' && discount && (
            <p className="text-green-600 text-sm mt-1">{discount}</p>
          )}
        </div>
        
        <Button 
          variant={popular ? 'default' : 'outline'} 
          href={cta.href}
          fullWidth
          className="mb-6"
        >
          {cta.text}
        </Button>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <span className={cn(
                'flex-shrink-0 mr-2 mt-0.5',
                feature.included ? 'text-green-500' : 'text-gray-300'
              )}>
                {feature.included ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className={cn(
                'text-sm',
                feature.included ? 'text-gray-700' : 'text-gray-400'
              )}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface PricingProps extends React.HTMLAttributes<HTMLDivElement> {
  tiers: Array<Omit<PricingTierProps, 'interval'>>
  className?: string
  columns?: 1 | 2 | 3 | 4
  showToggle?: boolean
}

export function Pricing({
  tiers,
  className,
  columns = 3,
  showToggle = true,
  ...props
}: PricingProps) {
  const [interval, setInterval] = React.useState<'monthly' | 'annually'>('monthly')
  
  return (
    <div className={className} {...props}>
      {showToggle && (
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              className={cn(
                'py-2 px-4 rounded-md text-sm font-medium focus:outline-none',
                interval === 'monthly' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              )}
              onClick={() => setInterval('monthly')}
            >
              Monthly
            </button>
            <button
              className={cn(
                'py-2 px-4 rounded-md text-sm font-medium focus:outline-none',
                interval === 'annually' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
              )}
              onClick={() => setInterval('annually')}
            >
              Annually
            </button>
          </div>
        </div>
      )}
      
      <div
        className={cn(
          'grid gap-6',
          columns === 1 && 'grid-cols-1',
          columns === 2 && 'grid-cols-1 md:grid-cols-2',
          columns === 3 && 'grid-cols-1 md:grid-cols-3',
          columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {tiers.map((tier, index) => (
          <PricingTier
            key={index}
            {...tier}
            interval={interval}
          />
        ))}
      </div>
    </div>
  )
}
