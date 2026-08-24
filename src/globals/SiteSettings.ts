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
