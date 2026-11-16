import Link from 'next/link'
import { PostGrid } from './PostCard'
import { Masthead } from './Masthead'
import { listingPath } from '../lib/site'

type Props = {
  eyebrow?: string
  title: string
  lede?: string
  posts: any[]
  page: number
  totalPages: number
  basePath: string
  children?: React.ReactNode
}

export const Listing = ({
  eyebrow,
  title,
  lede,
  posts,
  page,
  totalPages,
  basePath,
  children,
}: Props) => (
  <>
    <Masthead compact />

    <section className="ph-section">
      <div className="ph-container">
        {eyebrow && <p className="ph-eyebrow">{eyebrow}</p>}
        <h1 className="ph-h1" style={eyebrow ? { marginTop: 'var(--ph-space-3)' } : undefined}>
          {title}
        </h1>
        {lede && (
          <p className="ph-lede" style={{ maxWidth: 'var(--ph-width-prose)' }}>
            {lede}
          </p>
        )}
        {children}

        <PostGrid posts={posts} />

        {totalPages > 1 && (
          <nav className="ph-pager" aria-label="Pagination">
            {page > 1 ? (
              <Link className="ph-btn ph-btn--ghost" href={listingPath(basePath, page - 1)}>
                Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="ph-pager__status">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link className="ph-btn ph-btn--ghost" href={listingPath(basePath, page + 1)}>
                More
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </section>
  </>
)
