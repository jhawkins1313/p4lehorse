import { SERVER_URL, SITE_NAME, SITE_TAGLINE, absoluteUrl, isoDate } from './site'

/**
 * JSON-LD for the front end. The nodes are context free and each page wraps the
 * ones it needs in `graph()`, so a page emits one script tag rather than a pile
 * of competing documents.
 *
 * Every page carries the Organization and the WebSite, and the per-article nodes
 * point at them by @id instead of restating them. That is what makes the site one
 * entity to a consumer rather than one anonymous publisher per URL.
 */
export const ORGANIZATION_ID = `${SERVER_URL}/#organization`
export const WEBSITE_ID = `${SERVER_URL}/#website`

/** Raster, because Google still treats a square PNG as the safe case for a logo. */
const LOGO = '/images/p4lehorse-icon-512.png'

type Node = Record<string, unknown>

export const graph = (...nodes: (Node | null | undefined)[]) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.filter(Boolean),
})

type Social = { label?: string | null; url?: string | null }

/**
 * The brand entity. `sameAs` is the part that earns its keep: it is how a search
 * engine ties p4lehorse.com to the accounts posting under the same name, which is
 * what a knowledge panel is assembled from.
 *
 * No `potentialAction` search action, on purpose. /search is disallowed in
 * robots.txt, and advertising a search endpoint a crawler is told not to fetch
 * only invites the sitelinks searchbox to fail.
 */
export const organizationNode = (social: Social[] = []): Node => {
  const sameAs = social
    .map((link) => link?.url)
    .filter((url): url is string => typeof url === 'string' && url.length > 0)

  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl('/'),
    description: SITE_TAGLINE,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(LOGO),
      width: 512,
      height: 512,
    },
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export const websiteNode = (): Node => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: absoluteUrl('/'),
  description: SITE_TAGLINE,
  publisher: { '@id': ORGANIZATION_ID },
  inLanguage: 'en',
})

export const breadcrumbNode = (trail: { name: string; path: string }[]): Node => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((step, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: step.name,
    item: absoluteUrl(step.path),
  })),
})

/**
 * Only two of the five formats have an index page, so a feature or a roundup gets
 * a two step trail rather than a crumb pointing at a 404.
 */
const FORMAT_LISTING: Record<string, { name: string; path: string }> = {
  review: { name: 'Reviews', path: '/reviews' },
  interview: { name: 'Interviews', path: '/interviews' },
}

export const postBreadcrumbNode = (post: any): Node => {
  const listing = FORMAT_LISTING[post.format]
  return breadcrumbNode([
    { name: 'Home', path: '/' },
    ...(listing ? [listing] : []),
    { name: post.title, path: `/posts/${post.slug}` },
  ])
}

/**
 * An article, never a Review.
 *
 * Google makes `reviewRating` a required property of schema.org/Review, and
 * P4LEHORSE does not score records. Claiming the type bought a Search Console
 * error on every piece and no rich result either way, so the type goes and the
 * record reaches the graph through `about`, which is what carried the album
 * entity in the first place. Nothing here implies a score.
 */
export const articleNode = ({
  post,
  artist,
  author,
  image,
}: {
  post: any
  artist?: any
  author?: any
  image?: string | null
}): Node => {
  const url = absoluteUrl(`/posts/${post.slug}`)

  const album = post.albumTitle
    ? {
        '@type': 'MusicAlbum',
        name: post.albumTitle,
        ...(artist?.name ? { byArtist: { '@type': 'MusicGroup', name: artist.name } } : {}),
        ...(post.releaseDate ? { datePublished: isoDate(post.releaseDate) } : {}),
        ...(post.label ? { recordLabel: { '@type': 'Organization', name: post.label } } : {}),
      }
    : null

  const genres = Array.isArray(post.genres)
    ? post.genres.filter((genre: any) => typeof genre === 'object' && genre?.name)
    : []

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt || undefined,
    // Freshness. Payload keeps updatedAt current, and without it a piece that has
    // been revised reads to a crawler as untouched since the day it went up.
    dateModified: post.updatedAt || post.publishedAt || undefined,
    inLanguage: 'en',
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    ...(author?.name ? { author: { '@type': 'Person', name: author.name } } : {}),
    // Named inline as well as referenced, so the article still describes its own
    // publisher if a consumer reads this node on its own.
    publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME },
    isPartOf: { '@id': WEBSITE_ID },
    ...(album ? { about: album } : {}),
    ...(genres.length ? { genre: genres.map((genre: any) => genre.name) } : {}),
  }
}
