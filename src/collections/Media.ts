import type { CollectionConfig } from 'payload'

const MEDIA_DIR = process.env.MEDIA_DIR || './media'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    description: 'Album art, artist photos, feature images.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: MEDIA_DIR,
    mimeTypes: ['image/*'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 240, height: 240, position: 'centre' },
      { name: 'card', width: 600, height: 600, position: 'centre' },
      { name: 'square', width: 1200, height: 1200, position: 'centre' },
      { name: 'wide', width: 1600, height: undefined },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'What the image shows, for screen readers. For cover art, "Cover of Album by Artist" is right. Leave decorative images blank only if they carry no information.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source, if one needs crediting.' },
    },
  ],
}
