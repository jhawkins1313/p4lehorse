import type { CollectionConfig } from 'payload'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { PullQuoteBlock } from '../blocks/PullQuoteBlock'
import { BlocksFeature } from '@payloadcms/richtext-lexical'
import { slugField, noEmDash } from '../fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description: 'Standing pages: About, Values, Submit music, Contact.',
  },
  versions: { drafts: true },
  access: {
    read: ({ req: { user } }) => (user ? true : { _status: { equals: 'published' } }),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    { name: 'title', type: 'text', required: true, validate: noEmDash },
    slugField('title'),
    {
      name: 'eyebrow',
      type: 'text',
      validate: noEmDash,
      admin: { description: 'Small uppercase line above the title. Optional.' },
    },
    {
      name: 'lede',
      type: 'textarea',
      maxLength: 300,
      validate: noEmDash,
      admin: { description: 'Opening statement, set larger than the body.' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          BlocksFeature({ blocks: [PullQuoteBlock] }),
        ],
      }),
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'List this page in the footer nav.' },
    },
  ],
}
