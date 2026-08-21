import type { Metadata } from 'next'
import { getPosts } from '../../../lib/queries'
import { Listing } from '../../../components/Listing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Interviews',
  description:
    'Conversations with the artists doing serious work at the edges of music, and getting almost no press for it.',
}

export default async function InterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const result = await getPosts({ format: 'interview', page, limit: 12 })

  return (
    <Listing
      eyebrow="Format"
      title="Interviews"
      lede="Conversations with the people making the records. Long, unhurried, and printed close to how they were said."
      posts={result.docs}
      page={page}
      totalPages={result.totalPages}
      basePath="/interviews"
    />
  )
}
