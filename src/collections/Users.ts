import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
  },
  auth: true,
  access: {
    // Any logged-in staff member can read the user list. Only admins create,
    // edit or delete accounts other than their own.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Byline name, written the way it should appear on an article.' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'writer',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Writer', value: 'writer' },
      ],
      admin: {
        description: 'Writers draft. Editors publish. Admins also manage accounts.',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      maxLength: 400,
      admin: { description: 'Two or three sentences. Shown at the foot of their articles.' },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
