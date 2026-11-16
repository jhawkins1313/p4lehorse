import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { payloadClient, listingMetadata, pageFromSegments } from '../../../../../lib/site'
import { getPosts } from '../../../../../lib/queries'
import { Listing } from '../../../../../components/Listing'
import { breadcrumbNode, graph } from '../../../../../lib/schema'

export const revalidate = 60

type Props = { params: Promise<{ slug: string; page?: string[] }> }

const findGenre = async (slug: string) => {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'genres',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] || null
}

/**
 * Every genre at page one. Exporting this at all is the point: a dynamic route
 * with no generateStaticParams is rendered fresh on every request and answers
 * `no-store`, which is the thing moving out of `?page=` was meant to fix. The
 * empty return in the Docker build is still enough to put the route on the ISR
 * path, the same way posts/[slug] does it.
 */
export async function generateStaticParams() {
  try {
    const payload = await payloadClient()
    const result = await payload.find({ collection: 'genres', limit: 200, depth: 0 })
    return result.docs.map((genre: any) => ({ slug: genre.slug, page: [] as string[] }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page } = await params
  const n = pageFromSegments(page)
  if (!n) return { title: 'That page is gone.' }

  const genre = await findGenre(slug)
  if (!genre) return { title: 'That page is gone.' }

  return listingMetadata({
    basePath: `/genre/${genre.slug}`,
    page: n,
    title: genre.name,
    description: genre.description || `${genre.name} coverage on P4LEHORSE.`,
  })
}

export default async function GenrePage({ params }: Props) {
  const { slug, page } = await params
  const n = pageFromSegments(page)
  if (!n) notFound()

  const genre = await findGenre(slug)
  if (!genre) notFound()

  const result = await getPosts({ genre: genre.id, page: n, limit: 12 })
  if (n > 1 && result.docs.length === 0) notFound()

  // Two steps, because there is no /genre index to point the middle one at.
  const jsonLd = graph(
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: genre.name, path: `/genre/${genre.slug}` },
    ]),
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Listing
        eyebrow="Genre"
        title={genre.name}
        lede={genre.description}
        posts={result.docs}
        page={n}
        totalPages={result.totalPages}
        basePath={`/genre/${genre.slug}`}
      />
    </>
  )
}
