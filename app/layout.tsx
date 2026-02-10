import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Refined Viewport for smooth Luma-style scrolling and preventing zoom on input focus
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents unintended zoom on mobile inputs
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Hafla — Event Discovery',
    template: '%s | Hafla'
  },
  description: 'Discover and book curated community experiences. Secure payments with M-Pesa and Rift USDC.',
  applicationName: 'Hafla',
  referrer: 'origin-when-cross-origin',
  keywords: ['events', 'ticketing', 'RSVP', 'nairobi events', 'web3 tickets', 'kenya events'],
  authors: [{ name: 'Hafla' }],
  creator: 'Hafla',
  publisher: 'Hafla',
  metadataBase: new URL('https://events.riftfi.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://events.riftfi.xyz',
    siteName: 'Hafla',
    title: 'Hafla — Event Discovery',
    description: 'Discover and book curated community experiences. Secure payments with M-Pesa and Rift USDC.',
    images: [
      {
        url: '/og-image.png', // Ensure you have a high-res editorial OG image
        width: 1200,
        height: 630,
        alt: 'Hafla Event Discovery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hafla — Event Discovery',
    description: 'Discover and book curated community experiences.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hafla',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 selection:text-orange-900">
      <head>
        {/* Luma uses a very clean head without redundant meta tags handled by Next.js metadata */}
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-[#fafafa] dark:bg-[#050505] text-neutral-900 dark:text-white`}>
        <Providers>
          {/* Main wrapper to ensure consistent scroll behavior and z-index context */}
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
        <Analytics />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}