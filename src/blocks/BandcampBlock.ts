import type { Block } from 'payload'
import { noEmDash } from '../fields/slug'

/**
 * Inline Bandcamp player, droppable anywhere in an article body.
 *
 * Bandcamp iframes cannot inherit CSS. The player's palette comes from two URL
 * parameters, bgcol and linkcol, which the renderer builds from the brand
 * tokens (#000000 and #FF2BD6). They are deliberately not editable here so they
 * can never drift out of sync with the design system.
 */
export const BandcampBlock: Block = {
  slug: 'bandcamp',
  labels: { singular: 'Bandcamp player', plural: 'Bandcamp players' },
  fields: [
    {
      name: 'albumId',
      type: 'text',
      required: true,
      admin: { description: 'The number after "album=" in Bandcamp\'s embed code. Digits only.' },
    },
    {
      name: 'trackId',
      type: 'text',
      admin: { description: 'Optional. The number after "track=" to open on a specific track.' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'Public album page, used for the fallback link.' },
    },
    {
      name: 'label',
      type: 'text',
      validate: noEmDash,
      admin: { description: 'Artist and album, e.g. Days ov Yore, The Tale of Vlad Țepeș part 1.' },
    },
  ],
}
