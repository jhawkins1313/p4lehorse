import Link from 'next/link'
import type { Metadata } from 'next'
import { getGenres, getHubCounts } from '../../../lib/queries'
import { Masthead } from '../../../components/Masthead'
import { listingMetadata } from '../../../lib/site'
import { breadcrumbNode, graph } from '../../../lib/schema'

export const revalidate = 60

const DESCRIPTION =
  'Every scene P4LEHORSE writes about, from black metal and hardcore to dungeon synth, shoegaze and cozy synth. Pick one and read the records.'

export const metadata: Metadata = listingMetadata({
  basePath: '/genre',
  page: 1,
  title: 'Genres',
  description: DESCRIPTION,
})

/**
 * The genre hubs existed and nothing linked to them. The only route in was the
 * tag list at the top of an article, so the pages a reader would most plausibly
 * search for, a scene plus the word reviews, were the ones with the least
 * standing in the site. This is the index they were missing.
 *
 * Genres with nothing behind them are left out rather than listed as empty.
 */
export default async function GenreIndexPage() {
  const [genres, counts] = await Promise.all([getGenres(), getHubCounts()])
  const stocked = genres.docs.filter((genre: any) => (counts.byGenre[genre.id] || 0) > 0)

  const jsonLd = graph(
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Genres', path: '/genre' },
    ]),
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Masthead compact />

      <section className="ph-section">
        <div className="ph-container ph-container--prose">
          <p className="ph-eyebrow">Browse</p>
          <h1 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
            Genres
          </h1>
          <p className="ph-lede">{DESCRIPTION}</p>

          {stocked.length === 0 ? (
            <p className="ph-muted">Nothing filed yet. Start from the reviews.</p>
          ) : (
            <ul className="ph-results">
              {stocked.map((genre: any) => {
                const count = counts.byGenre[genre.id] || 0
                return (
                  <li key={genre.id}>
                    <h3>
                      <Link href={`/genre/${genre.slug}`}>{genre.name}</Link>
                    </h3>
                    <p>
                      {genre.description ||
                        `${count} ${count === 1 ? 'piece' : 'pieces'} on P4LEHORSE.`}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
