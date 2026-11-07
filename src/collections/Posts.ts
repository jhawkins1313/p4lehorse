import type { CollectionConfig } from 'payload'
import {
  HeadingFeature,
  BlocksFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField, noEmDash } from '../fields/slug'
import { validateYouTubeUrl } from '../lib/youtube'
import { MusicBlock } from '../blocks/MusicBlock'
import { PullQuoteBlock } from '../blocks/PullQuoteBlock'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'format', 'publishedAt', '_status'],
    group: 'Content',
    description:
      'Album reviews, interviews, scene features, retrospectives and roundups. There is no news desk.',
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/posts/${data?.slug || ''}`,
    },
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 20,
  },
  access: {
    // The public sees published articles only. Staff see everything.
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        _status: { equals: 'published' },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      validate: noEmDash,
      admin: { description: 'The headline. Sentence case reads better at display sizes.' },
    },
    slugField('title'),
    {
      type: 'tabs',
      tabs: [
        // -------------------------------------------------------------- Article
        {
          label: 'Article',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              required: true,
              maxLength: 220,
              validate: noEmDash,
              admin: {
                description:
                  'One or two sentences from the piece, cut at a natural stop. Used on cards, in search results, and as the meta description fallback.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                  BlocksFeature({ blocks: [MusicBlock, PullQuoteBlock] }),
                ],
              }),
              admin: {
                description:
                  'House style: album titles in italic, track titles in quotation marks, no em dashes, no scores.',
              },
            },
          ],
        },
        // -------------------------------------------------------------- Record
        {
          label: 'Record',
          description:
            'Fill this in for album reviews and retrospectives. Interviews and features can leave it blank.',
          fields: [
            {
              name: 'artist',
              type: 'relationship',
              relationTo: 'artists',
              hasMany: false,
              admin: { description: 'Create the artist first if they are not in the list yet.' },
            },
            {
              name: 'albumTitle',
              type: 'text',
              validate: noEmDash,
              admin: {
                description: 'Title only, no artist name. It renders in italic automatically.',
              },
            },
            {
              name: 'releaseDate',
              type: 'date',
              admin: {
                date: { pickerAppearance: 'dayOnly' },
                description: 'Release date of the record, not the publish date of the review.',
              },
            },
            {
              name: 'label',
              type: 'text',
              admin: { description: 'Record label, or "Self-released".' },
            },
            {
              name: 'coverArt',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Square, 1200px or larger. Framed in neutral #3A3A42 on the site, never magenta, because cover colors are unpredictable.',
              },
            },
          ],
        },
        // ------------------------------------------------------------ The Pick
        {
          label: 'The Pick',
          description:
            'The P4LEHORSE Pick block that sits under the review. Bandcamp when the record is there, YouTube Music when it is not. The Bandcamp player colors are set from the brand tokens automatically, so there is nothing to keep in sync by hand.',
          fields: [
            {
              name: 'bandcamp',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  defaultValue: 'bandcamp',
                  options: [
                    { label: 'Bandcamp', value: 'bandcamp' },
                    { label: 'YouTube Music', value: 'youtube' },
                  ],
                  admin: {
                    description:
                      'Where the Pick plays from. Bandcamp is the first choice because the money reaches the artist. YouTube Music is how an artist who is not on Bandcamp still gets heard.',
                  },
                },
                {
                  name: 'albumId',
                  type: 'text',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.platform !== 'youtube',
                    description:
                      'The number after "album=" in the embed code Bandcamp gives you. Digits only.',
                  },
                },
                {
                  name: 'trackId',
                  type: 'text',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.platform !== 'youtube',
                    description:
                      'Optional. The number after "track=" if you want the player to open on a specific track.',
                  },
                },
                {
                  name: 'youtubeUrl',
                  label: 'YouTube Music link',
                  type: 'text',
                  validate: validateYouTubeUrl,
                  admin: {
                    condition: (_data, siblingData) => siblingData?.platform === 'youtube',
                    description:
                      'Paste the share link and nothing else, e.g. https://music.youtube.com/watch?v=dQw4w9WgXcQ. A link carrying an album (list=OLAK5uy_...) plays the record through. A plain track link plays the one song.',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    condition: (_data, siblingData) => siblingData?.platform !== 'youtube',
                    description:
                      'The public album page, e.g. https://artist.bandcamp.com/album/record-name. Used for the "Hear the full album" line under the player. A YouTube Pick needs nothing here; it builds that line from the link above.',
                  },
                },
                {
                  name: 'quote',
                  type: 'textarea',
                  maxLength: 300,
                  validate: noEmDash,
                  admin: {
                    description:
                      'Pull quote shown above the player. Pick the line that lands the thesis, not the one that sounds most impressive.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // ------------------------------------------------------------------ Sidebar
    {
      name: 'format',
      type: 'select',
      required: true,
      defaultValue: 'review',
      options: [
        { label: 'Album review', value: 'review' },
        { label: 'Interview', value: 'interview' },
        { label: 'Scene feature', value: 'feature' },
        { label: 'Retrospective', value: 'retrospective' },
        { label: 'Roundup', value: 'roundup' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'genres',
      type: 'relationship',
      relationTo: 'genres',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
      admin: { position: 'sidebar' },
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Set this to a future time to schedule the piece.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData?._status === 'published' && !value) return new Date()
            return value
          },
        ],
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Runs large at the top of the homepage. One at a time works best.',
      },
    },
  ],
}
