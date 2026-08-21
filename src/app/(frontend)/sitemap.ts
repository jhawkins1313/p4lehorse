import type { MetadataRoute } from 'next'
import { payloadClient, SERVER_URL } from '../../lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await payloadClient()
  const published = { _status: { equals: 'published' } }

  const [posts, pages, genres, artists] = await Promise.all([
    payload.find({ collection: 'posts', where: published, limit: 1000, depth: 0 }),
    payload.find({ collection: 'pages', where: published, limit: 100, depth: 0 }),
    payload.find({ collection: 'genres', limit: 200, depth: 0 }),
    payload.find({ collection: 'artists', limit: 1000, depth: 0 }),
  ])

  const staticRoutes = ['', '/extreme', '/fringe', '/reviews', '/interviews'].map((path) => ({
    url: `${SERVER_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  return [
    ...staticRoutes,
    ...posts.docs.map((doc: any) => ({
      url: `${SERVER_URL}/posts/${doc.slug}`,
      lastModified: new Date(doc.updatedAt),
      priority: 0.7,
    })),
    ...pages.docs.map((doc: any) => ({
      url: `${SERVER_URL}/${doc.slug}`,
      lastModified: new Date(doc.updatedAt),
      priority: 0.5,
    })),
    ...genres.docs.map((doc: any) => ({
      url: `${SERVER_URL}/genre/${doc.slug}`,
      priority: 0.4,
    })),
    ...artists.docs.map((doc: any) => ({
      url: `${SERVER_URL}/artists/${doc.slug}`,
      priority: 0.4,
    })),
  ]
}
