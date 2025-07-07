'use client';

import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function Features({
  title,
  subtitle,
  description,
  items = [],
  columns = 2,
  className = '',
  variant = 'default'
}) {
  return (
    <div className={`mx-auto max-w-5xl ${className}`}>
      {title && (
        <h2 className="text-3xl font-bold tracking-tight text-center mb-2">
          {title}
        </h2>
      )}
      
      {subtitle && (
        <h3 className="text-xl font-medium text-center text-gray-600 mb-2">
          {subtitle}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
          {description}
        </p>
      )}
      
      <div className={`grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-${columns} lg:grid-cols-${columns}`}>
        {items.map((item, i) => (
          <div 
            key={i} 
            className={variant === 'cards' 
              ? 'bg-white p-6 rounded-lg shadow-md' 
              : variant === 'minimal' 
                ? '' 
                : 'flex gap-x-3'
            }
          >
            {variant !== 'minimal' && (
              <div className="flex-shrink-0">
                {item.icon ? (
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-100 text-primary-600">
                    {item.icon}
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary-100 text-primary-600">
                    <FiCheck size={16} />
                  </div>
                )}
              </div>
            )}
            
            <div>
              <h3 className={`text-lg font-medium ${variant !== 'default' ? 'mb-2' : ''}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="text-gray-600 mt-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
