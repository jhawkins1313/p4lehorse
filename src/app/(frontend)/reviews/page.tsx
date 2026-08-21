import type { Metadata } from 'next'
import { getPosts } from '../../../lib/queries'
import { Listing } from '../../../components/Listing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Reviews',
  description:
    'Album reviews from P4LEHORSE. No numerical scores, no star ratings. Judgment lives in the prose.',
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const result = await getPosts({ format: 'review', page, limit: 12 })

  return (
    <Listing
      eyebrow="Format"
      title="Reviews"
      lede="No numerical scores, no star ratings, no takedowns. Judgment lives in the prose."
      posts={result.docs}
      page={page}
      totalPages={result.totalPages}
      basePath="/reviews"
    />
  )
}
