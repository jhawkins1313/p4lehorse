import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const payloadClient = async () => getPayload({ config })

/** Brand tokens the Bandcamp iframe needs as URL parameters. No leading hash. */
const BANDCAMP_BG = '000000' // --ph-void
const BANDCAMP_LINK = 'ff2bd6' // --ph-accent

/**
 * Bandcamp iframes cannot inherit CSS, so the palette has to travel in the src.
 * Building it here is what stops the two values drifting away from the tokens.
 */
export const bandcampEmbedSrc = (albumId: string, trackId?: string | null): string => {
  const parts = [
    `album=${albumId}`,
    'size=large',
    `bgcol=${BANDCAMP_BG}`,
    `linkcol=${BANDCAMP_LINK}`,
    'tracklist=false',
    'artwork=small',
  ]
  if (trackId) parts.push(`track=${trackId}`)
  parts.push('transparent=true')
  return `https://bandcamp.com/EmbeddedPlayer/${parts.join('/')}/`
}

export const FORMAT_LABELS: Record<string, string> = {
  review: 'Review',
  interview: 'Interview',
  feature: 'Feature',
  retrospective: 'Retrospective',
  roundup: 'Roundup',
}

/** 19 August 2026. Long form for bylines. */
export const formatDate = (value?: string | null): string => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** 19 Aug 2026. Short form for cards. */
export const formatDateShort = (value?: string | null): string => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const isoDate = (value?: string | null): string =>
  value ? new Date(value).toISOString().slice(0, 10) : ''

/** Absolute URL, required for og:image and RSS. Relative paths break scrapers. */
export const absoluteUrl = (path: string): string =>
  path.startsWith('http') ? path : `${SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`

export const SITE_NAME = 'P4LEHORSE'
export const SITE_TAGLINE = 'A digital space for the extreme and the fringe.'
export const OG_IMAGE = '/images/p4lehorse-og-1200x630.png'

/**
 * Next replaces `openGraph` wholesale when a page declares it rather than
 * merging it into the layout's, so a page that needs its own og:url has to
 * restate the site-level fields or quietly lose them. Building them here is what
 * stops the five call sites drifting apart.
 *
 * The `url` is the point. Next emits no og:url at all unless openGraph.url is
 * set explicitly: it does not read the canonical for it. Without one, a share of
 * the wrong hostname counts as a separate object to every social graph.
 */
export const siteOpenGraph = ({
  path,
  title,
  description,
}: {
  path: string
  title?: string
  description?: string
}): Metadata['openGraph'] => ({
  type: 'website',
  siteName: SITE_NAME,
  url: absoluteUrl(path),
  title: title || SITE_NAME,
  description: description || SITE_TAGLINE,
  images: [{ url: absoluteUrl(OG_IMAGE), width: 1200, height: 630 }],
})

/**
 * A listing and its pages 2..n render the same title and description, which
 * reads as duplicate content. Each page carries its own title and points its
 * canonical at itself: pointing page 2 back at page 1 is what tells Google to
 * drop the articles that only appear deeper in the run.
 */
export const listingMetadata = ({
  basePath,
  page,
  title,
  description,
}: {
  basePath: string
  page: number
  title: string
  description?: string
}): Metadata => {
  const path = listingPath(basePath, page)
  const pagedTitle = page > 1 ? `${title}, page ${page}` : title

  return {
    title: pagedTitle,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: siteOpenGraph({ path, title: pagedTitle, description }),
  }
}

/** `/reviews`, then `/reviews/page/3`. Page one keeps the bare path as its only name. */
export const listingPath = (basePath: string, page: number): string =>
  page > 1 ? `${basePath}/page/${page}` : basePath

/**
 * Pagination lives in the path rather than in a `?page=` search param because
 * reading a search param opts a route out of static rendering altogether. Every
 * listing, genre and artist page was rendering from the database on each request
 * and answering `no-store`, which is 29 of the 54 URLs in the sitemap. As a path
 * segment it caches like anything else.
 *
 * Returns null for a shape that is not a page, `/page/1` included: page one is
 * reached at the bare path and must not have a second name.
 */
export const pageFromSegments = (segments?: string[]): number | null => {
  if (!segments?.length) return 1
  if (segments.length !== 2 || segments[0] !== 'page') return null
  const page = Number(segments[1])
  return Number.isInteger(page) && page >= 2 ? page : null
}
