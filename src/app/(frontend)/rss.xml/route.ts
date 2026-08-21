import { getPosts } from '../../../lib/queries'
import { absoluteUrl, SERVER_URL } from '../../../lib/site'

export const revalidate = 300

const escape = (input: string): string =>
  String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export async function GET() {
  const result = await getPosts({ limit: 40 })

  const items = result.docs
    .map((post: any) => {
      const artist = typeof post.artist === 'object' ? post.artist : null
      const title =
        post.format === 'review' && post.albumTitle && artist?.name
          ? `${post.albumTitle} — ${artist.name}`
          : post.title
      const url = absoluteUrl(`/posts/${post.slug}`)
      const image = post.coverArt?.sizes?.square?.url || post.coverArt?.url

      return `    <item>
      <title>${escape(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
      <description>${escape(post.excerpt)}</description>
      <category>${escape(post.section === 'extreme' ? 'Extreme' : 'Fringe')}</category>${
        image ? `\n      <enclosure url="${absoluteUrl(image)}" type="image/jpeg" />` : ''
      }
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>P4LEHORSE</title>
    <link>${SERVER_URL}</link>
    <description>A digital space for the extreme and the fringe.</description>
    <language>en</language>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
