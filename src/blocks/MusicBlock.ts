import type { Block } from 'payload'
import { noEmDash } from '../fields/slug'
import { validateYouTubeUrl } from '../lib/youtube'

/**
 * Inline music player, droppable anywhere in an article body. Bandcamp or
 * YouTube Music, one per block.
 *
 * Bandcamp is the first choice: it is where the underground actually releases
 * and the money reaches the artist. Plenty of the artists worth covering are
 * not on it, though, and a review that cannot play a note of the record is a
 * worse outcome than an embed from a platform we would not have picked. The
 * YouTube arm exists for exactly that case.
 *
 * Bandcamp iframes cannot inherit CSS. The player's palette comes from two URL
 * parameters, bgcol and linkcol, which the renderer builds from the brand
 * tokens (#000000 and #FF2BD6). They are deliberately not editable here so they
 * can never drift out of sync with the design system. YouTube's player takes no
 * palette at all, which is the price of using it.
 *
 * The slug stays 'bandcamp'. It is the key every block already saved in an
 * article body is stored under, and in the lexical JSON and in the block's own
 * database table. Renaming it would orphan every existing player.
 */
export const MusicBlock: Block = {
  slug: 'bandcamp',
  labels: { singular: 'Music player', plural: 'Music players' },
  fields: [
    {
      name: 'platform',
      type: 'select',
      defaultValue: 'bandcamp',
      options: [
        { label: 'Bandcamp', value: 'bandcamp' },
        { label: 'YouTube Music', value: 'youtube' },
      ],
      admin: { description: 'Where this one plays from.' },
    },
    {
      name: 'albumId',
      type: 'text',
      validate: (value: unknown, args: any) => {
        if ((args?.siblingData?.platform || 'bandcamp') !== 'bandcamp') return true
        return value ? true : 'Required for a Bandcamp player.'
      },
      admin: {
        condition: (_data, siblingData) => siblingData?.platform !== 'youtube',
        description: 'The number after "album=" in Bandcamp\'s embed code. Digits only.',
      },
    },
    {
      name: 'trackId',
      type: 'text',
      admin: {
        condition: (_data, siblingData) => siblingData?.platform !== 'youtube',
        description: 'Optional. The number after "track=" to open on a specific track.',
      },
    },
    {
      name: 'youtubeUrl',
      label: 'YouTube Music link',
      type: 'text',
      validate: (value: unknown, args: any) => {
        if ((args?.siblingData?.platform || 'bandcamp') !== 'youtube') return true
        if (!value) return 'Required for a YouTube Music player.'
        return validateYouTubeUrl(value)
      },
      admin: {
        condition: (_data, siblingData) => siblingData?.platform === 'youtube',
        description:
          'Paste the share link, e.g. https://music.youtube.com/watch?v=dQw4w9WgXcQ. A link carrying an album (list=OLAK5uy_...) plays the record through. A plain track link plays the one song.',
      },
    },
    {
      name: 'url',
      type: 'text',
      validate: (value: unknown, args: any) => {
        if ((args?.siblingData?.platform || 'bandcamp') !== 'bandcamp') return true
        return value ? true : 'Required for a Bandcamp player.'
      },
      admin: {
        condition: (_data, siblingData) => siblingData?.platform !== 'youtube',
        description:
          'Public album page, used for the "Hear the full album" line under the player. A YouTube player needs nothing here; it builds that line from the link above.',
      },
    },
    {
      name: 'label',
      type: 'text',
      validate: noEmDash,
      admin: { description: 'Artist and album, e.g. Days ov Yore, The Tale of Vlad Țepeș part 1.' },
    },
  ],
}
