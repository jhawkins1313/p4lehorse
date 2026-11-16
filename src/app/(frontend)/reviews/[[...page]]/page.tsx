import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPosts } from '../../../../lib/queries'
import { Listing } from '../../../../components/Listing'
import { listingMetadata, pageFromSegments } from '../../../../lib/site'

export const revalidate = 60

const DESCRIPTION =
  'Album reviews from P4LEHORSE. No numerical scores, no star ratings. Judgment lives in the prose.'

type Props = { params: Promise<{ page?: string[] }> }

/**
 * Page one, and nothing else. Exporting this at all is the point: a dynamic
 * route with no generateStaticParams is rendered fresh on every request and
 * answers `no-store`, which is the thing moving out of `?page=` was meant to
 * fix. With it, the deeper pages render on demand and cache from then on.
 */
export async function generateStaticParams() {
  return [{ page: [] as string[] }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params
  const n = pageFromSegments(page)
  if (!n) return { title: 'That page is gone.' }

  return listingMetadata({
    basePath: '/reviews',
    page: n,
    title: 'Reviews',
    description: DESCRIPTION,
  })
}

export default async function ReviewsPage({ params }: Props) {
  const { page } = await params
  const n = pageFromSegments(page)
  if (!n) notFound()

  const result = await getPosts({ format: 'review', page: n, limit: 12 })
  // Past the end there is nothing to show, and without this it would be an
  // endless run of empty pages for a crawler to walk.
  if (n > 1 && result.docs.length === 0) notFound()

  return (
    <Listing
      title="Reviews"
      posts={result.docs}
      page={n}
      totalPages={result.totalPages}
      basePath="/reviews"
    />
  )
}
