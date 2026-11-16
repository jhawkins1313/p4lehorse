/**
 * The engraving, as the only image worth paying for up front.
 *
 * It was a 1,027,030 byte PNG preloaded at high priority on the homepage and
 * every listing, which made it the LCP element and the single largest thing the
 * site served. The same engraving is 197KB as WebP at full width and 90KB at
 * half, and AVIF takes that to 118KB and 67KB. Compression holds up on the
 * hatching: RMSE against the PNG is 3.11, and the wordmark edges stay clean.
 *
 * `.ph-masthead img` in the brand kit sets `width: 100%; max-width: 1592px`, so
 * the rendered width is min(100vw, 1592px) and `sizes` says exactly that. The
 * PNG stays as the fallback for anything that can take neither format.
 */
const SIZES = '(max-width: 1592px) 100vw, 1592px'

const srcSet = (ext: string) =>
  `/images/p4lehorse-masthead-796.${ext} 796w, /images/p4lehorse-masthead-1592.${ext} 1592w`

export const Masthead = ({ compact = false }: { compact?: boolean }) => (
  <div className={compact ? 'ph-masthead ph-masthead--compact' : 'ph-masthead'}>
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={SIZES} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={SIZES} />
      <img
        src="/images/p4lehorse-masthead-1592.png"
        alt="P4LEHORSE"
        width={1592}
        height={830}
        decoding="async"
        // Only the homepage hero earns the priority hint. On a listing the
        // masthead is a header, and the heading below it is what the reader is
        // waiting for.
        fetchPriority={compact ? undefined : 'high'}
      />
    </picture>
  </div>
)
