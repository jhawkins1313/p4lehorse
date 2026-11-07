import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import { Pick } from './Pick'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    // Keyed by block slug, which is still 'bandcamp' now that the block takes
    // YouTube Music too. See the note in blocks/MusicBlock.ts.
    bandcamp: ({ node }: any) => (
      <Pick
        platform={node.fields.platform}
        albumId={node.fields.albumId}
        trackId={node.fields.trackId}
        url={node.fields.url}
        youtubeUrl={node.fields.youtubeUrl}
        label={node.fields.label}
        eyebrow="Listen"
      />
    ),
    pullQuote: ({ node }: any) => (
      <blockquote className="ph-quote">
        {node.fields.quote}
        {node.fields.attribution && <cite>{node.fields.attribution}</cite>}
      </blockquote>
    ),
  },
})

export const RichText = ({ data }: { data: any }) => {
  if (!data) return null
  return <LexicalRichText className="ph-prose" converters={converters} data={data} />
}
