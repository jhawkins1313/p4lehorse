import { bandcampEmbedSrc } from '../lib/site'

type Props = {
  albumId: string
  trackId?: string | null
  url?: string | null
  quote?: string | null
  label?: string | null
  eyebrow?: string
}

/**
 * The P4LEHORSE Pick block. bgcol and linkcol come from lib/site.ts, which reads
 * them off the brand tokens, so a palette change never leaves a stale player behind.
 */
export const Bandcamp = ({
  albumId,
  trackId,
  url,
  quote,
  label,
  eyebrow = 'P4LEHORSE Pick',
}: Props) => {
  if (!albumId) return null
  const title = label ? `${label} on Bandcamp` : 'Bandcamp player'

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

        <div className="ph-bandcamp__player">
          <iframe src={bandcampEmbedSrc(albumId, trackId)} loading="lazy" title={title}>
            <a href={url || '#'}>{label || 'Listen on Bandcamp'}</a>
          </iframe>
        </div>

        {url && (
          <p className="ph-bandcamp__footer">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Hear the full album on Bandcamp &rarr;
            </a>
          </p>
        )}
      </div>
      <hr className="ph-rule" />
    </figure>
  )
}
