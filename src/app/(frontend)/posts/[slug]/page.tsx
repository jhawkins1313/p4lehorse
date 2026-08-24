import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPostBySlug, getPosts } from '../../../../lib/queries'
import { RichText } from '../../../../components/RichText'
import { Bandcamp } from '../../../../components/Bandcamp'
import { PostGrid } from '../../../../components/PostCard'
import { Subscribe } from '../../../../components/Subscribe'
import {
  FORMAT_LABELS,
  formatDate,
  isoDate,
  absoluteUrl,
} from '../../../../lib/site'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  // The Docker build renders against a throwaway database with no content in
  // it. Returning nothing there is correct: every article is still reachable,
  // Next just renders it on first request and caches it from then on.
  try {
    const result = await getPosts({ limit: 100 })
    return result.docs.map((post: any) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'That page is gone.' }

  const artist = typeof post.artist === 'object' ? post.artist : null
  // Album art beats the masthead as a per-article card: it is the thing a
  // reader recognises in a feed.
  const image = post.coverArt?.sizes?.square?.url || post.coverArt?.url

  const title =
    post.format === 'review' && post.albumTitle && artist?.name
      ? `${post.albumTitle} — ${artist.name}`
      : post.title

  return {
    title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      title,
      description: post.excerpt,
      publishedTime: post.publishedAt || undefined,
      images: image
        ? [{ url: absoluteUrl(image), width: 1200, height: 1200 }]
        : [{ url: absoluteUrl('/images/p4lehorse-og-1200x630.png'), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.excerpt,
      images: [absoluteUrl(image || '/images/p4lehorse-og-1200x630.png')],
    },
    alternates: { canonical: absoluteUrl(`/posts/${post.slug}`) },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const artist = typeof post.artist === 'object' ? post.artist : null
  const author = typeof post.author === 'object' ? post.author : null
  const genres = Array.isArray(post.genres)
    ? post.genres.filter((g: any) => typeof g === 'object')
    : []

  // Related runs on format now that the sections are gone. A young site can hold
  // only one piece in a format, so fall back to the latest rather than render an
  // empty block.
  const sameFormat = await getPosts({ format: post.format, limit: 3, exclude: post.id })
  const related = sameFormat.docs.length
    ? sameFormat
    : await getPosts({ limit: 3, exclude: post.id })
  const relatedLabel = sameFormat.docs.length
    ? `More ${FORMAT_LABELS[post.format].toLowerCase()}s`
    : 'Latest'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.format === 'review' ? 'Review' : 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: author?.name ? { '@type': 'Person', name: author.name } : undefined,
    publisher: { '@type': 'Organization', name: 'P4LEHORSE' },
    ...(post.format === 'review' && post.albumTitle
      ? {
          itemReviewed: {
            '@type': 'MusicAlbum',
            name: post.albumTitle,
            byArtist: artist?.name
              ? { '@type': 'MusicGroup', name: artist.name }
              : undefined,
          },
          // No reviewRating, on purpose. P4LEHORSE does not score records.
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <section className="ph-section ph-article-head">
          <div className="ph-container ph-container--prose">
            <p className="ph-eyebrow">{FORMAT_LABELS[post.format]}</p>
            <h1 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
              {post.title}
            </h1>

            <div className="ph-byline">
              {author?.name && <strong>{author.name}</strong>}
              {author?.name && <span>&middot;</span>}
              <time dateTime={isoDate(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
              {genres.length > 0 && <span>&middot;</span>}
              {genres.length > 0 && <span>{genres.map((g: any) => g.name).join(', ')}</span>}
            </div>

            {genres.length > 0 && (
              <ul className="ph-tags" style={{ marginBottom: 'var(--ph-space-6)' }}>
                {genres.map((genre: any) => (
                  <li key={genre.id}>
                    <Link className="ph-tag" href={`/genre/${genre.slug}`}>
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {(post.coverArt || post.albumTitle) && (
              <div className="ph-record">
                {post.coverArt && (
                  <img
                    className="ph-cover"
                    src={post.coverArt.sizes?.square?.url || post.coverArt.url}
                    alt={post.coverArt.alt || ''}
                    width={1200}
                    height={1200}
                  />
                )}
                <dl>
                  {artist?.name && (
                    <>
                      <dt>Artist</dt>
                      <dd>
                        <Link href={`/artists/${artist.slug}`}>{artist.name}</Link>
                      </dd>
                    </>
                  )}
                  {post.albumTitle && (
                    <>
                      <dt>Album</dt>
                      <dd>
                        <em className="ph-album">{post.albumTitle}</em>
                      </dd>
                    </>
                  )}
                  {post.releaseDate && (
                    <>
                      <dt>Released</dt>
                      <dd>{formatDate(post.releaseDate)}</dd>
                    </>
                  )}
                  {post.label && (
                    <>
                      <dt>Label</dt>
                      <dd>{post.label}</dd>
                    </>
                  )}
                  {artist?.country && (
                    <>
                      <dt>From</dt>
                      <dd>{artist.country}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}

            <p className="ph-lede">{post.excerpt}</p>

            <RichText data={post.content} />

            {author?.name && (
              <div className="ph-author">
                {author.avatar?.url && (
                  <img src={author.avatar.url} alt="" width={56} height={56} />
                )}
                <p>
                  <strong>{author.name}</strong>
                  {author.bio}
                </p>
              </div>
            )}
          </div>

          {/* The Pick closes the review it belongs to, so it stays inside the
              article section. In its own ph-section the two sets of block
              padding stacked up and left it 160px clear of the byline. */}
          {post.bandcamp?.albumId && (
            <div className="ph-container ph-article-pick">
              <Bandcamp
                albumId={post.bandcamp.albumId}
                trackId={post.bandcamp.trackId}
                url={post.bandcamp.url}
                quote={post.bandcamp.quote}
                label={
                  artist?.name && post.albumTitle
                    ? `${artist.name} · ${post.albumTitle}`
                    : post.title
                }
              />
            </div>
          )}
        </section>
      </article>

      {related.docs.length > 0 && (
        <section className="ph-section">
          <div className="ph-container">
            <p className="ph-eyebrow">{relatedLabel}</p>
            <h2 className="ph-h2" style={{ marginTop: 0 }}>
              Keep going
            </h2>
            <PostGrid posts={related.docs} />
          </div>
        </section>
      )}

      <Subscribe source={`post:${post.slug}`} />
    </>
  )
}
