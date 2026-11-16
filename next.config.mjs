import { withPayload } from '@payloadcms/next/withPayload'

/**
 * The canonical host, read from the same build arg the metadata uses so there is
 * still one place to change if the domain ever moves. Next evaluates redirects()
 * during the build and bakes the result into the routes manifest, and the
 * Dockerfile sets this as an ENV before `npm run build`, so it is available.
 */
const { host: CANONICAL_HOST, protocol: CANONICAL_PROTOCOL } = new URL(
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
)

const IS_LOCAL = CANONICAL_HOST.startsWith('www.') || CANONICAL_HOST.startsWith('localhost')

/**
 * Pagination moved out of `?page=` and into the path. Anything already linking or
 * indexed against the old shape is sent to the new one. The pattern deliberately
 * will not match `page=1`: page one lives at the bare path, so that request falls
 * through and is served there, under its own canonical.
 */
const PAGE_QUERY = { type: 'query', key: 'page', value: '(?<n>[2-9]|[1-9][0-9]+)' }

const pageRedirect = (source, destination) => ({
  source,
  has: [PAGE_QUERY],
  destination,
  permanent: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Album art and masthead are served locally out of the Payload media dir.
    remotePatterns: [],
  },

  async headers() {
    // Next serves everything in public/ with `max-age=14400`, which is four hours
    // for files that have not changed since the site launched. The content hashed
    // output under /_next/static already gets a year; these are the ones that were
    // missing out. Images stop short of `immutable` on purpose: the filenames
    // carry no hash, so a replaced masthead has to be able to reach people who
    // already have the old one.
    const year = 'public, max-age=31536000, immutable'
    const month = 'public, max-age=2592000, stale-while-revalidate=86400'

    return [
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: year }] },
      { source: '/logo/:path*', headers: [{ key: 'Cache-Control', value: year }] },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: month }] },
    ]
  },

  async redirects() {
    const redirects = [
      pageRedirect('/reviews', '/reviews/page/:n'),
      pageRedirect('/interviews', '/interviews/page/:n'),
      pageRedirect('/genre/:slug', '/genre/:slug/page/:n'),
      pageRedirect('/artists/:slug', '/artists/:slug/page/:n'),
    ]

    // www served the whole site at 200 alongside the apex, which splits every
    // ranking signal in two. Matching on the Host header makes a loop impossible:
    // the destination is a different host, so the redirect cannot match again.
    // The http to https half of this belongs at the edge, not here, because
    // deciding it from X-Forwarded-Proto loops the site if the proxy ever
    // terminates TLS and forwards plain http.
    if (!IS_LOCAL) {
      redirects.push({
        source: '/:path*',
        has: [{ type: 'host', value: `www.${CANONICAL_HOST}` }],
        destination: `${CANONICAL_PROTOCOL}//${CANONICAL_HOST}/:path*`,
        permanent: true,
      })
    }

    return redirects
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
