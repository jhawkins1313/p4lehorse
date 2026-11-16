import type { MetadataRoute } from 'next'
import { payloadClient, SERVER_URL } from '../../lib/site'
import { getHubCounts } from '../../lib/queries'

export const revalidate = 3600

const modified = (value?: string | null): Date | undefined =>
  value ? new Date(value) : undefined

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await payloadClient()
  const published = { _status: { equals: 'published' } }

  const [posts, pages, genres, artists, counts] = await Promise.all([
    payload.find({
      collection: 'posts',
      where: published,
      limit: 1000,
      depth: 0,
      sort: '-updatedAt',
    }),
    payload.find({ collection: 'pages', where: published, limit: 100, depth: 0 }),
    payload.find({ collection: 'genres', limit: 200, depth: 0 }),
    payload.find({ collection: 'artists', limit: 1000, depth: 0 }),
    getHubCounts(),
  ])

  // Every index changes when the newest article does. Reporting `new Date()` for
  // them, as this used to, stamps a fresh time on those URLs each time the
  // sitemap revalidates, which teaches a crawler that the field is noise here and
  // to stop reading it on the entries where it is true.
  const newest = modified(posts.docs[0]?.updatedAt)

  const indexes = ['', '/reviews', '/interviews', '/genre', '/artists'].map((path) => ({
    url: `${SERVER_URL}${path}`,
    lastModified: newest,
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  return [
    ...indexes,
    ...posts.docs.map((doc: any) => ({
      url: `${SERVER_URL}/posts/${doc.slug}`,
      lastModified: modified(doc.updatedAt),
      priority: 0.7,
    })),
    ...pages.docs.map((doc: any) => ({
      url: `${SERVER_URL}/${doc.slug}`,
      lastModified: modified(doc.updatedAt),
      priority: 0.5,
    })),
    // These carried no lastModified at all, which was 29 of the 54 URLs here.
    // Hubs with nothing published behind them are left out: they are noindex, and
    // a sitemap that asks for a page it also refuses is a contradiction a crawler
    // has to spend budget resolving.
    ...genres.docs
      .filter((doc: any) => (counts.byGenre[doc.id] || 0) > 0)
      .map((doc: any) => ({
        url: `${SERVER_URL}/genre/${doc.slug}`,
        lastModified: modified(doc.updatedAt),
        priority: 0.4,
      })),
    ...artists.docs
      .filter((doc: any) => (counts.byArtist[doc.id] || 0) > 0)
      .map((doc: any) => ({
        url: `${SERVER_URL}/artists/${doc.slug}`,
        lastModified: modified(doc.updatedAt),
        priority: 0.4,
      })),
  ]
}
