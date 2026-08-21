import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Artists: CollectionConfig = {
  slug: 'artists',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'slug'],
    group: 'Content',
    description:
      'Bands and solo artists. Write the name the way the artist writes it, diacritics and all. Never strip them to make the type behave.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description:
          'Exactly as the artist writes it. Alte Haas Grotesk has no Romanian, Polish, Czech, Hungarian, Turkish, Cyrillic or Greek glyphs, so those characters fall back to the next font in the stack. That is expected and correct.',
      },
    },
    slugField('name'),
    {
      name: 'country',
      type: 'text',
      admin: { position: 'sidebar', description: 'Where the artist is based.' },
    },
    {
      name: 'formed',
      type: 'number',
      admin: { position: 'sidebar', description: 'Year formed, if known.' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 800,
      admin: { description: 'Short factual background. Judgment belongs in the reviews.' },
    },
    {
      name: 'links',
      type: 'group',
      fields: [
        { name: 'bandcamp', type: 'text', admin: { description: 'Full artist page URL.' } },
        { name: 'website', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
  ],
}
