import React from 'react'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Yoga for PE',
  description: 'Transform PE classes with yoga - videos, resources, and support for educators',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
