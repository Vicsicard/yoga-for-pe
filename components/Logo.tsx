"use client"

import React from 'react'
import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center py-4">
      <div className="relative w-full h-24 flex items-center justify-start">
        <div className="absolute left-0 top-0 w-[300px] h-24 overflow-visible">
          <Image
            src="/images/logo.png"
            alt="Yoga for PE Logo"
            width={600}
            height={120}
            className="transform scale-150 origin-left"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              marginTop: '5px'
            }}
            priority
          />
        </div>
      </div>
    </div>
  )
}
