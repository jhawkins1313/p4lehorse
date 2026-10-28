import Link from 'next/link'
import { getPosts, getSettings } from '../../lib/queries'
import { PostGrid } from '../../components/PostCard'
import { Subscribe } from '../../components/Subscribe'
import { PlaylistPicks } from '../../components/PlaylistPicks'
import { FORMAT_LABELS, formatDate, isoDate } from '../../lib/site'
import { getPlaylistTracks, PICKS_PLAYLIST_ID, PICKS_PLAYLIST_URL } from '../../lib/youtube'

export const revalidate = 60

const BLANK =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23121216'/%3E%3C/svg%3E"

export default async function HomePage() {
  const settings = await getSettings()

  const featuredResult = await getPosts({ featured: true, limit: 1 })
  const featured = featuredResult.docs[0] || null

  // Everything new is the plain latest six with nothing held back, so the
  // featured article runs here too: the feature block is a spotlight, not a
  // removal. A featured piece older than the six takes the last slot rather
  // than going missing from the run.
  const latest = await getPosts({ limit: 6 })
  const latestDocs =
    !featured || latest.docs.some((p: any) => p.id === featured.id)
      ? latest.docs
      : [...latest.docs.slice(0, 5), featured]

  // The listening prompt at the foot of the page. The constants are a floor
  // under the settings rather than a repeat of the field defaults: an editor
  // can empty a text field, and the block has to survive that with its link
  // still pointing somewhere real.
  const picks = await getPlaylistTracks(settings?.playlistId || PICKS_PLAYLIST_ID)

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
          <PostGrid posts={latestDocs} />
        </div>
      </section>

      <PlaylistPicks
        tracks={picks}
        url={settings?.playlistUrl || PICKS_PLAYLIST_URL}
        heading={settings?.playlistHeading}
        blurb={settings?.playlistBlurb}
        cover={settings?.playlistCover}
      />

      <Subscribe
        heading={settings?.subscribeHeading}
        sub={settings?.subscribeSub}
        source="homepage"
      />
    </>
  )
}
