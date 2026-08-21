import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="ph-section ph-error-page">
      <div className="ph-container ph-container--prose ph-center">
        <p className="ph-eyebrow">404</p>
        <h1 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
          That page is gone.
        </h1>
        <p className="ph-lede" style={{ marginInline: 'auto' }}>
          The music isn&rsquo;t. Start from the reviews.
        </p>
        <p style={{ marginTop: 'var(--ph-space-6)' }}>
          <Link className="ph-btn ph-btn--primary" href="/reviews">
            Latest reviews
          </Link>{' '}
          <Link className="ph-btn ph-btn--ghost" href="/">
            Home
          </Link>
        </p>
      </div>
    </section>
  )
}
