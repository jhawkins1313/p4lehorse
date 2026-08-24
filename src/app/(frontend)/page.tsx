import Link from 'next/link'
import { getPosts, getSettings } from '../../lib/queries'
import { PostGrid } from '../../components/PostCard'
import { Subscribe } from '../../components/Subscribe'
import { Bandcamp } from '../../components/Bandcamp'
import { FORMAT_LABELS, formatDate, isoDate } from '../../lib/site'

export const revalidate = 60

const BLANK =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23121216'/%3E%3C/svg%3E"

export default async function HomePage() {
  const settings = await getSettings()

  const featuredResult = await getPosts({ featured: true, limit: 1 })
  const featured = featuredResult.docs[0] || null

  const latest = await getPosts({ limit: 6, exclude: featured?.id })

  // The Pick block runs whichever recent article has a player attached, the
  // featured one included: it is the listening prompt, not a second teaser.
  const pickPool = await getPosts({ limit: 12 })
  const pick = pickPool.docs.find((p: any) => p.bandcamp?.albumId) || null
  const pickArtist = pick && typeof pick.artist === 'object' ? pick.artist : null

  return (
    <>
      {/* The engraving already contains the wordmark. No live type over it. */}
      <div className="ph-masthead">
        <img src="/images/p4lehorse-masthead-1592.png" alt="P4LEHORSE" width={1592} height={830} />
      </div>

      <section className="ph-section">
        <div className="ph-container ph-container--prose">
          <p className="ph-eyebrow">The Underground</p>
          <h1 className="ph-h1">
            {settings?.homeHeading || 'A digital space for the extreme and the fringe.'}
          </h1>
          <p className="ph-lede">{settings?.homeLede}</p>
          <p style={{ marginTop: 'var(--ph-space-5)' }}>
            <Link className="ph-btn ph-btn--primary" href="/about">
              Read the manifesto
            </Link>{' '}
            <Link className="ph-btn ph-btn--ghost" href="/reviews">
              Latest reviews
            </Link>
          </p>
        </div>
      </section>

      {featured && (
        <>
          <hr className="ph-rule" />
          <section className="ph-section">
            <div className="ph-container">
              <div className="ph-feature">
                <img
                  className="ph-feature__art"
                  src={featured.coverArt?.sizes?.square?.url || featured.coverArt?.url || BLANK}
                  alt={featured.coverArt?.alt || ''}
                  width={1200}
                  height={1200}
                />
                <div>
                  <p className="ph-eyebrow">{FORMAT_LABELS[featured.format]}</p>
                  <h2 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
                    <Link href={`/posts/${featured.slug}`}>{featured.title}</Link>
                  </h2>
                  <p className="ph-lede">{featured.excerpt}</p>
                  <div className="ph-byline">
                    {typeof featured.author === 'object' && featured.author?.name && (
                      <>
                        <strong>{featured.author.name}</strong>
                        <span>&middot;</span>
                      </>
                    )}
                    <time dateTime={isoDate(featured.publishedAt)}>
                      {formatDate(featured.publishedAt)}
                    </time>
                  </div>
                  <p style={{ marginTop: 'var(--ph-space-5)' }}>
                    <Link className="ph-btn ph-btn--primary" href={`/posts/${featured.slug}`}>
                      Read the review
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <hr className="ph-rule" />

      <section className="ph-section">
        <div className="ph-container">
          <div className="ph-section-head">
            <div>
              <p className="ph-eyebrow">Latest</p>
              <h2 className="ph-h2" style={{ marginTop: 0 }}>
                Everything new
              </h2>
            </div>
            <Link className="ph-btn ph-btn--quiet" href="/reviews">
              More
            </Link>
          </div>
          <PostGrid posts={latest.docs} />
        </div>
      </section>

      {pick && (
        <section className="ph-section">
          <div className="ph-container">
            <Bandcamp
              albumId={pick.bandcamp.albumId}
              trackId={pick.bandcamp.trackId}
              url={pick.bandcamp.url}
              quote={pick.bandcamp.quote || pick.excerpt}
              label={
                pickArtist?.name && pick.albumTitle
                  ? `${pickArtist.name} · ${pick.albumTitle}`
                  : pick.title
              }
            />
          </div>
        </section>
      )}

      <Subscribe
        heading={settings?.subscribeHeading}
        sub={settings?.subscribeSub}
        source="homepage"
      />
    </>
  )
}
