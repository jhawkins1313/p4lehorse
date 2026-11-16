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
 * URL slug, plus the lock that decides who owns it.
 *
 * Left unlocked, the slug follows its source field for as long as the document
 * is a draft. That is the whole point of the pair. Drafts autosave every 800ms,
 * so the first save lands while the headline is still being typed, and the hook
 * this replaces filled the slug from that fragment, then saw a non-empty value
 * on every save after and left it alone. The fragment became the permalink:
 * /posts/the-in is "The Infinite Piano Hall", /posts/holy is "HOLY by xDOULOSx".
 *
 * Locked, the slug is whatever the editor wrote and nothing touches it. This is
 * the honest version of the heuristic it replaces, which tried to tell those two
 * cases apart by asking whether the slug was a leading fragment of the title. It
 * could not distinguish a truncation from a deliberate shortening that happened
 * to start the same way, so it repaired some and not others.
 *
 * Publishing freezes the slug either way, because by then it is the permalink
 * and the title can still be rewritten afterwards. Typing in the field still
 * changes it, which is how one that went out wrong gets corrected.
 */
export const slugField = (from = 'title'): Field[] => [
  {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description:
        'Fills itself in from the title and keeps up with it until the piece is published. To write your own, tick the box below first.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data, originalDoc }) => {
          const source = data?.[from]
          const fromSource =
            typeof source === 'string' && source.length > 0 ? slugify(source) : ''
          const current = typeof value === 'string' && value.length > 0 ? slugify(value) : ''

          // An update carries only the fields it is changing, so everything this
          // decides on has to fall back to what is stored. Reading the lock from
          // `data` alone unlocks the slug on any save that does not resend it,
          // and reading the slug from `value` alone re-derives one that was
          // meant to stay put.
          const stored = typeof originalDoc?.slug === 'string' ? originalDoc.slug : ''
          const locked = data?.slugLock ?? originalDoc?.slugLock

          // Already out in the world: the slug is the permalink. Typing a new one
          // still works, which is how a bad one gets corrected.
          if (originalDoc?._status === 'published') return current || stored || fromSource || value

          // The editor has taken it over.
          if (locked) return current || stored || fromSource || value

          return fromSource || current || stored || value
        },
      ],
    },
  },
  {
    name: 'slugLock',
    label: 'Write the slug myself',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
      description:
        'Off, and the slug tracks the title until the piece is published. Tick it before typing a slug of your own, or the next autosave will write over it.',
    },
  },
]

/**
 * House style, enforced at the field level: no em dashes anywhere in copy.
 * See the brand kit README. Returns true when clean, an error string when not.
 */
export const noEmDash = (value: unknown): true | string => {
  if (typeof value === 'string' && /[\u2014\u2013]/.test(value)) {
    return 'House style: no em dashes or en dashes. Use a comma, a colon, or a full stop.'
  }
  return true
}
