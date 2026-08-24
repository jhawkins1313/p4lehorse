import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { payloadClient } from '../../../../lib/site'
import { getPosts } from '../../../../lib/queries'
import { Listing } from '../../../../components/Listing'

export const revalidate = 60

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const genre = await findGenre(slug)
  if (!genre) return { title: 'That page is gone.' }
  return {
    title: genre.name,
    description: genre.description || `${genre.name} coverage on P4LEHORSE.`,
  }
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const genre = await findGenre(slug)
  if (!genre) notFound()

  const result = await getPosts({ genre: genre.id, page, limit: 12 })

  return (
    <Listing
      eyebrow="Genre"
      title={genre.name}
      lede={genre.description}
      posts={result.docs}
      page={page}
      totalPages={result.totalPages}
      basePath={`/genre/${genre.slug}`}
    />
  )
}
