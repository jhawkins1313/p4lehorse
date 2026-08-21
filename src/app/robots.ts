import type { MetadataRoute } from 'next'
import { SERVER_URL } from '../lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/search'],
      },
    ],
    sitemap: `${SERVER_URL}/sitemap.xml`,
  }
}
