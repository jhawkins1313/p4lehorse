/**
 * Small helpers for hand-writing Lexical documents in the seed script.
 * Nothing here is used at runtime by the site.
 */

const root = (children: any[]) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children,
  },
})

const textNode = (text: string, format = 0) => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

export const p = (...children: any[]) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: children.map((c) => (typeof c === 'string' ? textNode(c) : c)),
})

/** Italic run. Lexical format bit 2 is italic; 1 is bold.
 *  Album titles take italic; track titles take quotation marks. */
export const em = (text: string) => textNode(text, 2)

export const h = (level: 2 | 3, text: string) => ({
  type: 'heading',
  tag: `h${level}`,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [textNode(text)],
})

export const pullQuote = (quote: string, attribution?: string) => ({
  type: 'block',
  format: '',
  version: 2,
  fields: {
    blockType: 'pullQuote',
    quote,
    ...(attribution ? { attribution } : {}),
  },
})

export const doc = root
