import Link from 'next/link'
import type { Metadata } from 'next'
import { searchPosts } from '../../../lib/queries'
import { FORMAT_LABELS, formatDateShort } from '../../../lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search the P4LEHORSE archive.',
  robots: { index: false },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const result = q ? await searchPosts(q) : { docs: [], totalDocs: 0 }

  return (
    <section className="ph-section">
      <div className="ph-container ph-container--prose">
        <p className="ph-eyebrow">Archive</p>
        <h1 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
          Search
        </h1>

        <form className="ph-search-form" action="/search" method="get">
          <label className="ph-visually-hidden" htmlFor="q">
            Search articles
          </label>
          <input
            className="ph-input"
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Artist, album, or a phrase"
          />
          <button className="ph-btn ph-btn--primary" type="submit">
            Search
          </button>
        </form>

        {q && result.docs.length === 0 && (
          <p className="ph-muted">No results. Try a broader term, or browse by genre.</p>
        )}

        {result.docs.length > 0 && (
          <>
            <p className="ph-meta ph-meta__dim">
              {result.totalDocs} {result.totalDocs === 1 ? 'result' : 'results'}
            </p>
            <ul className="ph-results">
              {result.docs.map((post: any) => {
                const artist = typeof post.artist === 'object' ? post.artist : null
                return (
                  <li key={post.id}>
                    <p className="ph-card__kicker">
                      {FORMAT_LABELS[post.format]} ·{' '}
                      {formatDateShort(post.publishedAt)}
                    </p>
                    <h3>
                      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>
                      {artist?.name ? `${artist.name}. ` : ''}
                      {post.excerpt}
                    </p>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </section>
  )
}
