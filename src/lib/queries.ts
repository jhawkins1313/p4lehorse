import { payloadClient } from './site'

/**
 * Every query in here returns loosely-typed documents on purpose. Payload's
 * generated types mark every relationship as `id | Doc`, and the front end
 * always fetches with depth, so narrowing each one at the call site would add
 * noise without adding safety.
 */
type Docs = { docs: any[]; totalDocs: number; totalPages: number; page?: number }

const published = { _status: { equals: 'published' } }

/**
 * The Users collection is closed to the public so nobody can scrape staff email
 * addresses off the REST API. That also means an unauthenticated `find` leaves
 * `author` as a bare id. Bylines still need a name, so we look the authors up
 * separately with an override and attach only the three public fields.
 */
const attachAuthors = async (docs: any[]): Promise<any[]> => {
  const ids = Array.from(
    new Set(docs.map((doc) => (typeof doc?.author === 'object' ? doc.author?.id : doc?.author))),
  ).filter(Boolean)

  if (ids.length === 0) return docs

  const payload = await payloadClient()
  const authors = await payload.find({
    collection: 'users',
    where: { id: { in: ids } },
    limit: ids.length,
    depth: 1,
    overrideAccess: true,
  })

  const byId = new Map(
    authors.docs.map((user: any) => [
      user.id,
      { id: user.id, name: user.name, bio: user.bio, avatar: user.avatar },
    ]),
  )

  return docs.map((doc) => {
    const id = typeof doc?.author === 'object' ? doc.author?.id : doc?.author
    return id && byId.has(id) ? { ...doc, author: byId.get(id) } : doc
  })
}

export const getSettings = async (): Promise<any> => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

type PostQuery = {
  format?: string
  genre?: number | string
  artist?: number | string
  limit?: number
  page?: number
  exclude?: number | string
  featured?: boolean
}

export const getPosts = async ({
  format,
  genre,
  artist,
  limit = 12,
  page = 1,
  exclude,
  featured,
}: PostQuery = {}): Promise<Docs> => {
  const payload = await payloadClient()

  const and: any[] = [published]
  if (format) and.push({ format: { equals: format } })
  if (genre) and.push({ genres: { in: [genre] } })
  if (artist) and.push({ artist: { equals: artist } })
  if (exclude) and.push({ id: { not_equals: exclude } })
  if (featured !== undefined) and.push({ featured: { equals: featured } })

  const result = await payload.find({
    collection: 'posts',
    where: { and },
    sort: '-publishedAt',
    limit,
    page,
    depth: 2,
    overrideAccess: false,
  })

  return { ...result, docs: await attachAuthors(result.docs) }
}

export const getPostBySlug = async (slug: string): Promise<any> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  if (!result.docs[0]) return null
  const [post] = await attachAuthors(result.docs)
  return post
}

export const getPageBySlug = async (slug: string): Promise<any> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  return result.docs[0] || null
}

export const getGenres = async (): Promise<Docs> => {
  const payload = await payloadClient()
  return payload.find({
    collection: 'genres',
    limit: 100,
    sort: 'name',
    depth: 0,
  })
}

export const searchPosts = async (q: string): Promise<Docs> => {
  const payload = await payloadClient()
  if (!q?.trim()) return { docs: [], totalDocs: 0, totalPages: 0 }
  return payload.find({
    collection: 'posts',
    where: {
      and: [
        published,
        {
          or: [
            { title: { like: q } },
            { excerpt: { like: q } },
            { albumTitle: { like: q } },
          ],
        },
      ],
    },
    limit: 40,
    depth: 2,
    sort: '-publishedAt',
    overrideAccess: false,
  })
}

export const getArtists = async (): Promise<Docs> => {
  const payload = await payloadClient()
  return payload.find({
    collection: 'artists',
    limit: 1000,
    sort: 'name',
    depth: 0,
  })
}

/**
 * Published post counts per genre and per artist, in one pass.
 *
 * The index pages need a count beside every hub and there are thirty or so of
 * them between the two, so counting per hub would be thirty round trips for a
 * page whose whole job is to be a list of links. It also decides what gets
 * listed at all: a hub with nothing behind it is a thin page, and linking to one
 * from an index and naming it in the sitemap is how a site accumulates them.
 */
export const getHubCounts = async (): Promise<{
  byGenre: Record<string, number>
  byArtist: Record<string, number>
}> => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'posts',
    where: published,
    limit: 1000,
    depth: 0,
    overrideAccess: false,
  })

  const byGenre: Record<string, number> = {}
  const byArtist: Record<string, number> = {}

  for (const post of result.docs as any[]) {
    const artist = typeof post.artist === 'object' ? post.artist?.id : post.artist
    if (artist) byArtist[artist] = (byArtist[artist] || 0) + 1

    for (const genre of Array.isArray(post.genres) ? post.genres : []) {
      const id = typeof genre === 'object' ? genre?.id : genre
      if (id) byGenre[id] = (byGenre[id] || 0) + 1
    }
  }

  return { byGenre, byArtist }
}
