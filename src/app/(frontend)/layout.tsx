import type { Metadata } from 'next'
import React from 'react'

import '../../styles/p4lehorse-tokens.css'
import '../../styles/p4lehorse-components.css'
import '../../styles/site.css'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { GoogleTag } from '../../components/GoogleTag'
import { SERVER_URL, SITE_NAME, SITE_TAGLINE, OG_IMAGE } from '../../lib/site'
import { getSettings } from '../../lib/queries'
import { graph, organizationNode, websiteNode } from '../../lib/schema'

export const metadata: Metadata = {
  metadataBase: new URL(SERVER_URL),
  title: {
    default: 'P4LEHORSE — Extreme and fringe music journalism',
    template: '%s | P4LEHORSE',
  },
  description:
    'A digital space for the extreme and the fringe. Album reviews, interviews, and scene features covering the metal, hardcore, synth, post-punk and shoegaze artists the industry overlooks.',
  applicationName: SITE_NAME,
  icons: {
    icon: [{ url: '/logo/favicon.svg', type: 'image/svg+xml' }],
    apple: '/images/apple-touch-icon-180.png',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [OG_IMAGE],
  },
  alternates: {
    types: { 'application/rss+xml': `${SERVER_URL}/rss.xml` },
  },
}

export const viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  // The social links are the whole point of the Organization node, so they come
  // from settings rather than a constant. Swallowing the failure matches the rest
  // of the front end: the Docker build renders against a throwaway database, and
  // a missing global there must not take the build down.
  const settings = await getSettings().catch(() => null)
  const siteJsonLd = graph(organizationNode(settings?.social), websiteNode())

  return (
    <html lang="en">
      <body>
        {/* Self hosted with font-display: swap, but the browser only discovers
            them once the stylesheet has parsed, so the headline swapped late on
            every first visit. React hoists these into the head. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/AlteHaasGrotesk-Regular.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fonts/AlteHaasGrotesk-Bold.woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <a className="ph-skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <GoogleTag />
      </body>
    </html>
  )
}
