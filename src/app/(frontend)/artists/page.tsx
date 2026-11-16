import Link from 'next/link'
import type { Metadata } from 'next'
import { getArtists, getHubCounts } from '../../../lib/queries'
import { Masthead } from '../../../components/Masthead'
import { listingMetadata } from '../../../lib/site'
import { breadcrumbNode, graph } from '../../../lib/schema'

export const revalidate = 60

const DESCRIPTION =
  'Every artist P4LEHORSE has covered, with everything written about each of them in one place.'

export const metadata: Metadata = listingMetadata({
  basePath: '/artists',
  page: 1,
  title: 'Artists',
  description: DESCRIPTION,
})

/**
 * As with the genres, these hubs were reachable only from the record panel of an
 * article that happened to name the act. An artist with nothing published is
 * left out: the page would be a name and a masthead.
 */
export default async function ArtistIndexPage() {
  const [artists, counts] = await Promise.all([getArtists(), getHubCounts()])
  const covered = artists.docs.filter((artist: any) => (counts.byArtist[artist.id] || 0) > 0)

  const jsonLd = graph(
    breadcrumbNode([
      { name: 'Home', path: '/' },
      { name: 'Artists', path: '/artists' },
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
            Artists
          </h1>
          <p className="ph-lede">{DESCRIPTION}</p>

          {covered.length === 0 ? (
            <p className="ph-muted">Nothing filed yet. Start from the reviews.</p>
          ) : (
            <ul className="ph-results">
              {covered.map((artist: any) => {
                const count = counts.byArtist[artist.id] || 0
                const meta = [artist.country, `${count} ${count === 1 ? 'piece' : 'pieces'}`]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <li key={artist.id}>
                    <h3>
                      <Link href={`/artists/${artist.slug}`}>{artist.name}</Link>
                    </h3>
                    <p>{artist.bio || meta}</p>
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
