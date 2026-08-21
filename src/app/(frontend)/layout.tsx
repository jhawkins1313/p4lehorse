import type { Metadata } from 'next'
import React from 'react'

import '../../styles/p4lehorse-tokens.css'
import '../../styles/p4lehorse-components.css'
import '../../styles/site.css'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { SERVER_URL } from '../../lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SERVER_URL),
  title: {
    default: 'P4LEHORSE — Extreme and fringe music journalism',
    template: '%s | P4LEHORSE',
  },
  description:
    'A digital space for the extreme and the fringe. Album reviews, interviews, and scene features covering the metal, hardcore, synth, post-punk and shoegaze artists the industry overlooks.',
  applicationName: 'P4LEHORSE',
  icons: {
    icon: [{ url: '/logo/favicon.svg', type: 'image/svg+xml' }],
    apple: '/images/apple-touch-icon-180.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'P4LEHORSE',
    title: 'P4LEHORSE',
    description: 'A digital space for the extreme and the fringe.',
    images: [{ url: '/images/p4lehorse-og-1200x630.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'P4LEHORSE',
    description: 'A digital space for the extreme and the fringe.',
    images: ['/images/p4lehorse-og-1200x630.png'],
  },
  alternates: {
    types: { 'application/rss+xml': `${SERVER_URL}/rss.xml` },
  },
}

export const viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="ph-skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
