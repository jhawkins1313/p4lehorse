import type { Field } from 'payload'

export const slugify = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

/**
 * URL slug, auto-filled from another field when left blank.
 * Editors can always override it; once a post is published the slug is the
 * permalink, so changing it breaks inbound links.
 */
export const slugField = (from = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Leave blank and it fills itself in from the title.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source = data?.[from]
        if (typeof source === 'string' && source.length > 0) return slugify(source)
        return value
      },
    ],
  },
})

/**
 * House style, enforced at the field level: no em dashes anywhere in copy.
 * See the brand kit README. Returns true when clean, an error string when not.
 */
export const noEmDash = (value: unknown): true | string => {
  if (typeof value === 'string' && /[—–]/.test(value)) {
    return 'House style: no em dashes or en dashes. Use a comma, a colon, or a full stop.'
  }
  return true
}
