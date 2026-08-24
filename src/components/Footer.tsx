import Link from 'next/link'
import { payloadClient } from '../lib/site'

export const Footer = async () => {
  const payload = await payloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

  const pages = await payload.find({
    collection: 'pages',
    where: { showInFooter: { equals: true }, _status: { equals: 'published' } },
    limit: 8,
    depth: 0,
    sort: 'title',
    overrideAccess: false,
  })

  const social = Array.isArray(settings?.social) ? settings.social : []

  return (
    <footer className="ph-footer">
      <div className="ph-container">
        <div className="ph-footer__grid">
          <div>
            <Link className="ph-wordmark" href="/" style={{ fontSize: 'var(--ph-text-xl)' }}>
              P4LEHORSE
            </Link>
            <p style={{ marginTop: 'var(--ph-space-3)', maxWidth: '22rem' }}>
              {settings?.footerBlurb ||
                'A digital space for the extreme and the fringe. Founded 2026 by Seph Hawkins.'}
            </p>
          </div>

          <div>
            <h4>Sections</h4>
            <ul>
              <li>
                <Link href="/reviews">Reviews</Link>
              </li>
              <li>
                <Link href="/interviews">Interviews</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Publication</h4>
            <ul>
              {pages.docs.map((page: any) => (
                <li key={page.id}>
                  <Link href={`/${page.slug}`}>{page.title}</Link>
                </li>
              ))}
              {pages.docs.length === 0 && (
                <li>
                  <Link href="/about">About</Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4>Elsewhere</h4>
            <ul>
              {social.map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/rss.xml">RSS</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="ph-footer__legal">
          {settings?.legal ||
            '© 2026 P4LEHORSE. Masthead engraving in the public domain. Typeface: Alte Haas Grotesk by Yann Le Coroller.'}
        </p>
        <p className="ph-footer__legal" style={{ marginTop: 'var(--ph-space-2)' }}>
          Written by people who actually listened.
        </p>
      </div>
    </footer>
  )
}
