import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { payloadClient, listingMetadata, pageFromSegments } from '../../../../../lib/site'
import { getPosts } from '../../../../../lib/queries'
import { Listing } from '../../../../../components/Listing'
import { breadcrumbNode, graph } from '../../../../../lib/schema'

export const revalidate = 60

type Props = { params: Promise<{ slug: string; page?: string[] }> }

const findArtist = async (slug: string) => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'artists',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] || null
}

/**
 * Every artist at page one. Exporting this at all is the point: a dynamic route
 * with no generateStaticParams is rendered fresh on every request and answers
 * `no-store`, which is the thing moving out of `?page=` was meant to fix. The
 * empty return in the Docker build is still enough to put the route on the ISR
 * path, the same way posts/[slug] does it.
 */
export async function generateStaticParams() {
  try {
    const payload = await payloadClient()
    const result = await payload.find({ collection: 'artists', limit: 1000, depth: 0 })
    return result.docs.map((artist: any) => ({ slug: artist.slug, page: [] as string[] }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page } = await params
  const n = pageFromSegments(page)
  if (!n) return { title: 'That page is gone.' }

  const artist = await findArtist(slug)
  if (!artist) return { title: 'That page is gone.' }

  const result = await getPosts({ artist: artist.id, limit: 1 })

  return {
    ...listingMetadata({
      basePath: `/artists/${artist.slug}`,
      page: n,
      title: artist.name,
      description: artist.bio || `Everything P4LEHORSE has written about ${artist.name}.`,
    }),
    // Same as the genres: an artist with nothing published is a name and a
    // masthead, and indexing one is how thin pages accumulate.
    ...(result.totalDocs === 0 ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function ArtistPage({ params }: Props) {
  const { slug, page } = await params
  const n = pageFromSegments(page)
  if (!n) notFound()

  const artist = await findArtist(slug)
  if (!artist) notFound()

  const result = await getPosts({ artist: artist.id, page: n, limit: 12 })
  if (n > 1 && result.docs.length === 0) notFound()

  // Two steps, because there is no /artists index to point the middle one at.
  const jsonLd = graph(
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: artist.name, path: `/artists/${artist.slug}` },
    ]),
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Listing
        eyebrow={[artist.country, artist.formed ? `Formed ${artist.formed}` : null]
          .filter(Boolean)
          .join(' · ')}
        title={artist.name}
        lede={artist.bio}
        posts={result.docs}
        page={n}
        totalPages={result.totalPages}
        basePath={`/artists/${artist.slug}`}
      >
        {artist.links?.bandcamp && (
          <p style={{ marginBlock: 'var(--ph-space-4)' }}>
            <a
              className="ph-btn ph-btn--ghost"
              href={artist.links.bandcamp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Bandcamp
            </a>{' '}
            {artist.links.website && (
              <a
                className="ph-btn ph-btn--quiet"
                href={artist.links.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website
              </a>
            )}
          </p>
        )}
      </Listing>
    </>
  )
}
