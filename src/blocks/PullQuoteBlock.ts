import type { Block } from 'payload'
import { noEmDash } from '../fields/slug'

/** Pull quote. The one place the warm neutral #D8D4C8 is allowed. */
export const PullQuoteBlock: Block = {
  slug: 'pullQuote',
  labels: { singular: 'Pull quote', plural: 'Pull quotes' },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      maxLength: 400,
      validate: noEmDash,
    },
    {
      name: 'attribution',
      type: 'text',
      validate: noEmDash,
      admin: { description: 'Optional. Who said it, or the artist and album it describes.' },
    },
  ],
}
