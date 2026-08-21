import Link from 'next/link'
import { PostGrid } from './PostCard'

type Props = {
  eyebrow: string
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
    <div className="ph-masthead ph-masthead--compact">
      <img src="/images/p4lehorse-masthead-1592.png" alt="P4LEHORSE" width={1592} height={830} />
    </div>

    <section className="ph-section">
      <div className="ph-container">
        <p className="ph-eyebrow">{eyebrow}</p>
        <h1 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
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
              <Link
                className="ph-btn ph-btn--ghost"
                href={page === 2 ? basePath : `${basePath}?page=${page - 1}`}
              >
                Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="ph-pager__status">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link className="ph-btn ph-btn--ghost" href={`${basePath}?page=${page + 1}`}>
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
