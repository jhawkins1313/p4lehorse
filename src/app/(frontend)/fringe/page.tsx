import Link from 'next/link'
import type { Metadata } from 'next'
import { getPosts, getGenres } from '../../../lib/queries'
import { Listing } from '../../../components/Listing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Fringe',
  description:
    'Alternative, synth, post-punk, shoegaze, and the strange lands in between. Reviews, interviews and features.',
}

export default async function FringePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const result = await getPosts({ section: 'fringe', page, limit: 12 })
  const genres = await getGenres('fringe')

  return (
    <Listing
      eyebrow="Section"
      title="Fringe"
      lede="Everything alternative, synth, post-punk, shoegaze, and the strange lands in between."
      posts={result.docs}
      page={page}
      totalPages={result.totalPages}
      basePath="/fringe"
    >
      {genres.docs.length > 0 && (
        <ul className="ph-tags" style={{ marginBlock: 'var(--ph-space-5)' }}>
          {genres.docs.map((genre: any) => (
            <li key={genre.id}>
              <Link className="ph-tag" href={`/genre/${genre.slug}`}>
                {genre.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Listing>
  )
}
