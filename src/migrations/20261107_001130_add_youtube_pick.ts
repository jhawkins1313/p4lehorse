import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`posts\` ADD \`bandcamp_platform\` text DEFAULT 'bandcamp';`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`bandcamp_youtube_url\` text;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_bandcamp_platform\` text DEFAULT 'bandcamp';`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_bandcamp_youtube_url\` text;`)

  // The column default only applies to rows written after this runs, so every
  // existing article reads back null. The renderer treats null as Bandcamp,
  // but the admin's select would show empty next to a filled in album id,
  // which looks like a half configured Pick. Say what they already are.
  await db.run(
    sql`UPDATE \`posts\` SET \`bandcamp_platform\` = 'bandcamp' WHERE \`bandcamp_platform\` IS NULL;`,
  )
  await db.run(
    sql`UPDATE \`_posts_v\` SET \`version_bandcamp_platform\` = 'bandcamp' WHERE \`version_bandcamp_platform\` IS NULL;`,
  )

  // Inline players already saved in an article body are lexical JSON inside the
  // content column rather than rows of their own, so there is nothing to
  // backfill there. A block saved without a platform renders as Bandcamp for
  // the same reason, and picks the field up the next time it is edited.
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`bandcamp_platform\`;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`bandcamp_youtube_url\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_bandcamp_platform\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_bandcamp_youtube_url\`;`)
}
