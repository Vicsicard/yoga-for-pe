"use client"

import React from 'react'
import Image from 'next/image'

export function Logo() {
  return (
    <div className="flex items-center">
      <div className="relative w-[300px] h-16 overflow-hidden">
        <Image
          src="/images/logo.png"
          alt="Yoga for PE Logo"
          width={500}
          height={100}
          className="object-contain object-left"
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            transform: 'scale(1.5)',
            transformOrigin: 'left center'
          }}
          priority
        />
      </div>
    </div>
  )
}
