import type { CSSProperties } from 'react'
import type { PlaylistTrack } from '../lib/youtube'

type Props = {
  tracks: PlaylistTrack[]
  url: string
  heading?: string | null
}

/** Seconds of travel per cover. Constant speed whatever the run length is. */
const SECONDS_PER_COVER = 5

/**
 * The playlist artwork, committed rather than uploaded. It is a fixed piece of
 * P4LEHORSE branding, not editorial, and it was previously an upload field with
 * a fallback to the newest sleeve in the run. That meant the block shipped
 * showing somebody's album cover until a human remembered to upload this file
 * into the production Media library, which is a separate database from any
 * local one. Holding it in the repo is what makes the block correct the moment
 * it deploys.
 */
const COVER_SRC = '/images/p4lehorse-picks-cover-480.jpg'

/**
 * P4LEHORSE PICKS. The standing listening rotation, at the foot of the homepage
 * where the single Bandcamp Pick used to sit. One record was a recommendation;
 * this is the whole room, and the job of the block is to get people onto the
 * playlist and keep them there.
 *
 * No JavaScript and no YouTube iframe. The drift is a CSS animation on a strip
 * that holds the run twice over, and everything clickable points at the
 * playlist.
 */
export const PlaylistPicks = ({ tracks, url, heading }: Props) => {
  if (!tracks.length || !url) return null

  const title = heading || 'P4LEHORSE PICKS'

  // Twice through. The animation travels exactly the width of one run, so the
  // frame it loops back to is identical to the one it left and nothing snaps.
  const strip = [...tracks, ...tracks]

  return (
    <section className="ph-picks">
      <hr className="ph-rule" />

      <div className="ph-container">
        <p className="ph-eyebrow">In rotation</p>
        <h2 className="ph-h2 ph-picks__title">{title}</h2>
        <p className="ph-picks__actions">
          <a className="ph-btn ph-btn--primary" href={url} target="_blank" rel="noopener noreferrer">
            Listen on YouTube Music
          </a>{' '}
          <a className="ph-btn ph-btn--ghost" href={url} target="_blank" rel="noopener noreferrer">
            Save the playlist
          </a>
        </p>

        {/* The artwork sits on the carousel's axis rather than above it, and the
            run drifts leftward into it: the rail underlaps the cover and the
            cover paints on top, so each record disappears behind the sleeve
            instead of stopping at a margin. The rotation feeds the playlist. */}
        <a
          className="ph-picks__rotation"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Listen to ${title} on YouTube Music`}
        >
          {/* The wrapper is what the run actually disappears into. It is opaque
              and spans the full height of the row, so a record taller than the
              sleeve cannot peek out above or below it at any width. */}
          <span className="ph-picks__hero">
            {/* Already square, so none of the crop the borrowed thumbnails need. */}
            <span className="ph-picks__frame ph-picks__frame--hero">
              <img src={COVER_SRC} alt={`Playlist artwork for ${title}`} width={480} height={480} />
            </span>
          </span>

          <div className="ph-picks__rail">
            <div
              className="ph-picks__strip"
              style={
                { '--ph-picks-duration': `${tracks.length * SECONDS_PER_COVER}s` } as CSSProperties
              }
            >
              {strip.map((item, i) => {
                // The second pass is the same records again. Hiding it from the
                // accessibility tree is what stops a screen reader reading the
                // rotation out twice.
                const repeat = i >= tracks.length
                return (
                  <figure
                    className="ph-picks__item"
                    key={`${item.videoId}-${i}`}
                    aria-hidden={repeat || undefined}
                  >
                    <span className="ph-picks__frame ph-picks__frame--yt">
                      <img
                        src={item.art}
                        alt={repeat ? '' : `Cover of ${item.title} by ${item.artist}`}
                        loading="lazy"
                        width={480}
                        height={360}
                      />
                    </span>
                    <figcaption>
                      <strong>{item.title}</strong>
                      <span>{item.artist}</span>
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </a>
      </div>

      <hr className="ph-rule" />
    </section>
  )
}
