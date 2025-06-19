"use client"

import React from 'react'

export function Logo() {
  return (
    <div className="flex items-center h-14 py-1">
      <img 
        src="/images/logo.png" 
        alt="Yoga for PE Logo" 
        style={{ 
          height: '100%',
          width: 'auto',
          maxWidth: '280px'
        }}
      />
    </div>
  )
}
