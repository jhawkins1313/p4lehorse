import type { MetadataRoute } from 'next'
import { SERVER_URL } from '../lib/site'

/**
 * Payload serves every image on the site out of /api/media/file/, so a blanket
 * `Disallow: /api` hid all of it: no album art in Google Images, and the og:image
 * on every article refused to the crawlers behind link previews, which respect
 * robots.txt. The media path is allowed and the rest of the API is named one
 * endpoint at a time, with nothing blocked that is a prefix of the media path.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/media/'],
        disallow: [
          '/admin',
          '/api/graphql',
          '/api/graphql-playground',
          '/api/subscribe',
          '/api/users',
          '/api/posts',
          '/api/pages',
          '/api/genres',
          '/api/artists',
          '/search',
        ],
      },
    ],
    sitemap: `${SERVER_URL}/sitemap.xml`,
  }
}
