import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const Genres: CollectionConfig = {
  slug: 'genres',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'section', 'slug'],
    group: 'Content',
    description:
      'Genre tags. Sentence case, always: "Black metal", "Dungeon synth", "Post-punk".',
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
      admin: { description: 'Sentence case. Only the first word and proper nouns take a capital.' },
    },
    slugField('name'),
    {
      name: 'section',
      type: 'select',
      required: true,
      defaultValue: 'extreme',
      options: [
        { label: 'Extreme', value: 'extreme' },
        { label: 'Fringe', value: 'fringe' },
      ],
      admin: {
        description:
          'Extreme is everything metal and hardcore. Fringe is everything alternative, synth, post-punk, shoegaze, and the strange lands in between.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'One or two sentences. Shown at the top of the genre page.' },
    },
  ],
}
