import { bandcampEmbedSrc } from '../lib/site'
import { parseYouTubeRef, youtubeEmbedSrc, youtubeMusicUrl } from '../lib/youtube'

type Props = {
  platform?: string | null
  albumId?: string | null
  trackId?: string | null
  url?: string | null
  youtubeUrl?: string | null
  quote?: string | null
  label?: string | null
  eyebrow?: string
}

/**
 * The P4LEHORSE Pick block, on Bandcamp or on YouTube Music.
 *
 * Bandcamp's bgcol and linkcol come from lib/site.ts, which reads them off the
 * brand tokens, so a palette change never leaves a stale player behind.
 *
 * YouTube takes no palette. music.youtube.com serves no iframe of its own and
 * refuses to be framed, so the only way to put that audio on a page is the
 * ordinary YouTube player: same track, same album playlists, a 16:9 frame
 * carrying the topic upload's cover art, and YouTube's own chrome over the top
 * of it. color=white in the src is as close to out of the way as it gets. The
 * two arms of this block are therefore not the same height, which is a fact
 * about the platforms rather than something to style around.
 *
 * The class names stay ph-bandcamp*. They are brand kit components, defined in
 * the read only p4lehorse-components.css, and the frame they draw is the Pick's
 * frame whatever is playing inside it.
 */
export const Pick = ({
  platform,
  albumId,
  trackId,
  url,
  youtubeUrl,
  quote,
  label,
  eyebrow = 'P4LEHORSE Pick',
}: Props) => {
  // Rows written before the platform field existed read back null, and every
  // one of them is a Bandcamp player.
  const youtube = platform === 'youtube'
  const ref = youtube ? parseYouTubeRef(youtubeUrl) : null

  if (youtube ? !ref : !albumId) return null

  const service = youtube ? 'YouTube Music' : 'Bandcamp'
  const title = label ? `${label} on ${service}` : `${service} player`
  const src = ref ? youtubeEmbedSrc(ref) : bandcampEmbedSrc(albumId as string, trackId)
  // A YouTube Pick derives its own way out rather than reading the url field,
  // which is Bandcamp's. An article switched over from Bandcamp still has the
  // old album page sitting in that column, and honouring it would put a line
  // reading "on YouTube Music" over a link to Bandcamp.
  const out = youtube ? youtubeMusicUrl(ref as NonNullable<typeof ref>) : url

  // A YouTube link that carries no album is one song, so the line cannot
  // promise a record behind it.
  const outLabel =
    youtube && !ref?.listId
      ? 'Hear it on YouTube Music'
      : `Hear the full album on ${service}`

  return (
    <figure className="ph-bandcamp">
      <hr className="ph-rule" />
      <div className="ph-bandcamp__inner">
        <p className="ph-eyebrow">{eyebrow}</p>

        {quote && (
          <blockquote className="ph-quote">
            {quote}
            {label && <cite>{label}</cite>}
          </blockquote>
        )}

        <div
          className={`ph-bandcamp__player${youtube ? ' ph-bandcamp__player--video' : ''}`}
        >
          {/* Nothing goes inside the iframe. HTML5 does not take fallback
              content there: the parser drops any children, so React renders an
              element on the server that is missing from the client DOM and
              hydration fails on every page with a player. The footer link is
              the way out to the record. */}
          <iframe
            src={src}
            loading="lazy"
            title={title}
            {...(youtube
              ? {
                  allow:
                    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                  allowFullScreen: true,
                  referrerPolicy: 'strict-origin-when-cross-origin' as const,
                }
              : {})}
          />
        </div>

        {out && (
          <p className="ph-bandcamp__footer">
            <a href={out} target="_blank" rel="noopener noreferrer">
              {outLabel} &rarr;
            </a>
          </p>
        )}
      </div>
      <hr className="ph-rule" />
    </figure>
  )
}
