import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { migrations } from './migrations'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Artists } from './collections/Artists'
import { Genres } from './collections/Genres'
import { Pages } from './collections/Pages'
import { Subscribers } from './collections/Subscribers'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    // Dark, always. The brand ground is true black and the custom skin in
    // (payload)/custom.scss only targets the dark theme.
    theme: 'dark',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · P4LEHORSE',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/logo/favicon.svg' }],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo#Logo',
        Icon: '/components/admin/Logo#Icon',
      },
    },
  },
  collections: [Posts, Artists, Genres, Media, Pages, Subscribers, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./p4lehorse.db',
    },
    // Payload will not push schema in production, and this app has no separate
    // migration step: it boots against a bind-mounted data directory that may
    // be completely empty on first run. Handing the migrations to the adapter
    // makes it run them itself on init, so an empty /data becomes a working
    // database with no intervention. The Docker build relies on the same thing
    // to render against a throwaway file.
    prodMigrations: migrations,
    // Dev runs the same migrations as production rather than pushing schema
    // straight at the file. It costs a `migrate:create` after every schema
    // change, and it buys one schema path instead of two: no drift between a
    // developer's database and the server's, and no "you ran this in dev mode"
    // prompt hanging a production build.
    push: false,
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
})
