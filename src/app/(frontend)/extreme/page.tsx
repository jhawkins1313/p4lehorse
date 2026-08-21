import Link from 'next/link'
import type { Metadata } from 'next'
import { getPosts, getGenres } from '../../../lib/queries'
import { Listing } from '../../../components/Listing'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Extreme',
  description:
    'Metal and hardcore. Album reviews, interviews and scene features from the heaviest end of the catalogue.',
}

export default async function ExtremePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1
  const result = await getPosts({ section: 'extreme', page, limit: 12 })
  const genres = await getGenres('extreme')

  return (
    <Listing
      eyebrow="Section"
      title="Extreme"
      lede="Everything metal and hardcore. Black, death, doom, sludge, grind, crust, and every hyphenate the scene has invented since."
      posts={result.docs}
      page={page}
      totalPages={result.totalPages}
      basePath="/extreme"
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
