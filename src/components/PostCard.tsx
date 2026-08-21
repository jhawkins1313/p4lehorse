import Link from 'next/link'
import { SECTION_LABELS, FORMAT_LABELS, formatDateShort, isoDate } from '../lib/site'

const BLANK =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23121216'/%3E%3C/svg%3E"

export const PostCard = ({ post }: { post: any }) => {
  const art = post.coverArt?.sizes?.card?.url || post.coverArt?.url || BLANK
  const artist = typeof post.artist === 'object' ? post.artist : null
  const kicker =
    post.format === 'review'
      ? SECTION_LABELS[post.section]
      : `${SECTION_LABELS[post.section]} · ${FORMAT_LABELS[post.format]}`

  return (
    <article className="ph-card">
      <img
        className="ph-card__art"
        src={art}
        alt={post.coverArt?.alt || ''}
        width={600}
        height={600}
        loading="lazy"
      />
      <div className="ph-card__body">
        <p className="ph-card__kicker">{kicker}</p>
        <h3 className="ph-card__title">
          <Link href={`/posts/${post.slug}`}>
            {post.format === 'review' && post.albumTitle ? (
              <em className="ph-album">{post.albumTitle}</em>
            ) : (
              post.title
            )}
          </Link>
        </h3>
        {artist?.name && <p className="ph-card__artist">{artist.name}</p>}
        <p className="ph-card__excerpt">{post.excerpt}</p>
        <p className="ph-card__footer">
          <time dateTime={isoDate(post.publishedAt)}>{formatDateShort(post.publishedAt)}</time>
        </p>
      </div>
    </article>
  )
}

export const PostGrid = ({ posts }: { posts: any[] }) => {
  if (!posts?.length) {
    return <p className="ph-muted">Nothing here yet. Check back.</p>
  }
  return (
    <div className="ph-grid" style={{ marginTop: 'var(--ph-space-6)' }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
