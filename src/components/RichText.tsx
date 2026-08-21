import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import { Bandcamp } from './Bandcamp'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    bandcamp: ({ node }: any) => (
      <Bandcamp
        albumId={node.fields.albumId}
        trackId={node.fields.trackId}
        url={node.fields.url}
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
