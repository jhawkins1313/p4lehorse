import type { GlobalConfig } from 'payload'
import { noEmDash } from '../fields/slug'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    group: 'Settings',
    description: 'Everything that appears on every page. Change it here, not in the code.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'tagline',
              type: 'text',
              defaultValue: 'A digital space for the extreme and the fringe.',
              validate: noEmDash,
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              maxLength: 200,
              defaultValue:
                'A digital space for the extreme and the fringe. Album reviews, interviews, and scene features covering the metal, hardcore, synth, post-punk and shoegaze artists the industry overlooks.',
              validate: noEmDash,
              admin: { description: 'Under 155 characters is the safe length for search results.' },
            },
            {
              name: 'homeHeading',
              type: 'text',
              defaultValue: 'A digital space for the extreme and the fringe.',
              validate: noEmDash,
              admin: { description: 'The H1 on the homepage.' },
            },
            {
              name: 'homeLede',
              type: 'textarea',
              maxLength: 500,
              validate: noEmDash,
              defaultValue:
                'Album reviews and interviews covering metal, hardcore, synth, post-punk, shoegaze, and the strange lands in between. We exist for artists doing serious work at the edges of music who get almost no press for doing it.',
            },
          ],
        },
        {
          label: 'Playlist',
          description:
            'The P4LEHORSE PICKS block at the foot of the homepage. The carousel fills itself from the playlist; everything here is the pitch around it.',
          fields: [
            {
              name: 'playlistHeading',
              type: 'text',
              defaultValue: 'P4LEHORSE PICKS',
              validate: noEmDash,
            },
            {
              name: 'playlistBlurb',
              type: 'textarea',
              maxLength: 300,
              validate: noEmDash,
              defaultValue:
                'What is actually on while the next reviews get written. Metal, hardcore, synth and the stranger edges, updated as records land.',
            },
            {
              name: 'playlistUrl',
              type: 'text',
              defaultValue: 'https://music.youtube.com/playlist?list=PLKV3QunHgQOQ',
              admin: {
                description:
                  'Where both buttons and every cover send people. Paste the share link without the si= tracking parameter.',
              },
            },
            {
              name: 'playlistId',
              type: 'text',
              defaultValue: 'PLKV3QunHgQOQ',
              admin: {
                description:
                  'The value after "list=" in that URL. This is what the carousel reads to find the most recent additions.',
              },
            },
            {
              name: 'playlistCover',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'The playlist artwork. YouTube signs its own copy of this image so it cannot be linked to directly: save it off the playlist page and upload it here. Without one, the newest cover in the run stands in.',
              },
            },
          ],
        },
        {
          label: 'Newsletter',
          fields: [
            {
              name: 'subscribeHeading',
              type: 'text',
              defaultValue: 'Get the next one in your inbox.',
              validate: noEmDash,
            },
            {
              name: 'subscribeSub',
              type: 'text',
              defaultValue: 'No spam, no algorithm, no filler. Just the records worth your time.',
              validate: noEmDash,
            },
          ],
        },
        {
          label: 'Elsewhere',
          fields: [
            {
              name: 'social',
              type: 'array',
              labels: { singular: 'Link', plural: 'Links' },
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
            {
              name: 'contactEmail',
              type: 'email',
              admin: { description: 'Shown on the Submit music and Contact pages.' },
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerBlurb',
              type: 'textarea',
              maxLength: 240,
              validate: noEmDash,
              defaultValue:
                'A digital space for the extreme and the fringe. Founded 2026 by Seph Hawkins.',
            },
            {
              name: 'legal',
              type: 'textarea',
              validate: noEmDash,
              defaultValue:
                '© 2026 P4LEHORSE. Masthead engraving in the public domain. Typeface: Alte Haas Grotesk by Yann Le Coroller.',
            },
          ],
        },
      ],
    },
  ],
}
