import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '../../../lib/queries'
import { payloadClient, absoluteUrl } from '../../../lib/site'
import { RichText } from '../../../components/RichText'

export const revalidate = 60
export const dynamicParams = true

export async function generateStaticParams() {
  const payload = await payloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    limit: 50,
    depth: 0,
  })
  return result.docs.map((page: any) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return { title: 'That page is gone.' }
  return {
    title: page.title,
    description: page.lede || undefined,
    alternates: { canonical: absoluteUrl(`/${page.slug}`) },
  }
}

export default async function StandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <section className="ph-section ph-article-head">
      <div className="ph-container ph-container--prose">
        {page.eyebrow && <p className="ph-eyebrow">{page.eyebrow}</p>}
        <h1 className="ph-h1" style={{ marginTop: 'var(--ph-space-3)' }}>
          {page.title}
        </h1>
        {page.lede && <p className="ph-lede">{page.lede}</p>}
        <hr className="ph-rule ph-rule--hair" />
        <RichText data={page.content} />
      </div>
    </section>
  )
}
