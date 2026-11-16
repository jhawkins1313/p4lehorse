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

  const result = await getPosts({ genre: genre.id, limit: 1 })

  return {
    ...listingMetadata({
      basePath: `/genre/${genre.slug}`,
      page: n,
      // The bare genre name was the whole title. What a reader actually searches
      // is the scene plus the thing they want to read about it, so the title says
      // that and the h1 stays the plain name it was designed as.
      title: `${genre.name} reviews and interviews`,
      description:
        genre.description ||
        `Album reviews, interviews and features filed under ${genre.name} at P4LEHORSE.`,
    }),
    // A hub with nothing behind it is a name and a masthead. It stays reachable
    // and still passes link equity on, it just does not belong in an index.
    ...(result.totalDocs === 0 ? { robots: { index: false, follow: true } } : {}),
  }
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
