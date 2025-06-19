"use client"

import React from 'react'
import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center">
      <div style={{ width: '1000px', height: '80px', position: 'relative' }}>
        <Image
          src="/images/logo.png"
          alt="Yoga for PE Logo"
          fill
          style={{ 
            objectFit: 'contain', 
            objectPosition: 'left center',
          }}
          priority
        />
      </div>
    </div>
  )
}
