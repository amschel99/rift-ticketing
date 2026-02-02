import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Rift - Event Ticketing Platform',
  description: 'Book and manage events effortlessly. Discover events, purchase tickets, and organize experiences.',
  generator: 'Next.js',
  applicationName: 'Rift',
  referrer: 'origin-when-cross-origin',
  keywords: ['events', 'ticketing', 'RSVP', 'event management', 'tickets'],
  authors: [{ name: 'Rift' }],
  creator: 'Rift',
  publisher: 'Rift',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://events.riftfi.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://events.riftfi.xyz',
    siteName: 'Rift',
    title: 'Rift - Event Ticketing Platform',
    description: 'Book and manage events effortlessly. Discover events, purchase tickets, and organize experiences.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Rift Event Ticketing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rift - Event Ticketing Platform',
    description: 'Book and manage events effortlessly. Discover events, purchase tickets, and organize experiences.',
    images: ['/logo.png'],
  },
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  manifest: '/logo.png',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
