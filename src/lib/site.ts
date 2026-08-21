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

export const SECTION_LABELS: Record<string, string> = {
  extreme: 'Extreme',
  fringe: 'Fringe',
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
