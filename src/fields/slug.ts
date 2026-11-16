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
      ({ value, data, originalDoc }) => {
        const source = data?.[from]
        const fromSource = typeof source === 'string' && source.length > 0 ? slugify(source) : ''
        const current = typeof value === 'string' && value.length > 0 ? slugify(value) : ''

        if (!current) return fromSource || value

        // Once a document has been published the slug is its permalink and is
        // never rewritten again, whatever happens to the title afterwards.
        if (originalDoc?._status === 'published') return current

        // Drafts autosave every 800ms, so the first save lands while the headline
        // is still being typed and this hook fills the slug from half a title.
        // It then saw a non-empty slug on every save after and left it alone, so
        // the fragment became the permalink: /posts/the-in for "The Infinite
        // Piano Hall", /posts/holy for "HOLY by xDOULOSx".
        //
        // A slug that is a leading fragment of the current title is that artefact
        // rather than a decision, so while the piece is unpublished it is brought
        // back up to date. A slug the editor actually chose is not a prefix of
        // the title and survives untouched.
        if (fromSource && fromSource !== current && fromSource.startsWith(current)) {
          return fromSource
        }

        return current
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
