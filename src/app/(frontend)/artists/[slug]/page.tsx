import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { payloadClient } from '../../../../lib/site'
import { getPosts } from '../../../../lib/queries'
import { Listing } from '../../../../components/Listing'

export const revalidate = 60

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const artist = await findArtist(slug)
  if (!artist) return { title: 'That page is gone.' }
  return {
    title: artist.name,
    description: artist.bio || `Everything P4LEHORSE has written about ${artist.name}.`,
  }
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const artist = await findArtist(slug)
  if (!artist) notFound()

  const result = await getPosts({ artist: artist.id, page, limit: 12 })

  return (
    <Listing
      eyebrow={[artist.country, artist.formed ? `Formed ${artist.formed}` : null]
        .filter(Boolean)
        .join(' · ')}
      title={artist.name}
      lede={artist.bio}
      posts={result.docs}
      page={page}
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
  )
}
