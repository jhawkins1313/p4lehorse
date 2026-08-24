import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tagline\` text DEFAULT 'A digital space for the extreme and the fringe.',
  	\`meta_description\` text DEFAULT 'A digital space for the extreme and the fringe. Album reviews, interviews, and scene features covering the metal, hardcore, synth, post-punk and shoegaze artists the industry overlooks.',
  	\`home_heading\` text DEFAULT 'A digital space for the extreme and the fringe.',
  	\`home_lede\` text DEFAULT 'Album reviews and interviews covering metal, hardcore, synth, post-punk, shoegaze, and the strange lands in between. We exist for artists doing serious work at the edges of music who get almost no press for doing it.',
  	\`subscribe_heading\` text DEFAULT 'Get the next one in your inbox.',
  	\`subscribe_sub\` text DEFAULT 'No spam, no algorithm, no filler. Just the records worth your time.',
  	\`contact_email\` text,
  	\`footer_blurb\` text DEFAULT 'A digital space for the extreme and the fringe. Founded 2026 by Seph Hawkins.',
  	\`legal\` text DEFAULT '© 2026 P4LEHORSE. Masthead engraving in the public domain. Typeface: Alte Haas Grotesk by Yann Le Coroller.',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "tagline", "meta_description", "home_heading", "home_lede", "subscribe_heading", "subscribe_sub", "contact_email", "footer_blurb", "legal", "updated_at", "created_at") SELECT "id", "tagline", "meta_description", "home_heading", "home_lede", "subscribe_heading", "subscribe_sub", "contact_email", "footer_blurb", "legal", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`section\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_section\`;`)
  await db.run(sql`ALTER TABLE \`genres\` DROP COLUMN \`section\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tagline\` text DEFAULT 'A digital space for the extreme and the fringe.',
  	\`meta_description\` text DEFAULT 'A digital space for the extreme and the fringe. Album reviews, interviews, and scene features covering the metal, hardcore, synth, post-punk and shoegaze artists the industry overlooks.',
  	\`home_heading\` text DEFAULT 'A digital space for the extreme and the fringe.',
  	\`home_lede\` text DEFAULT 'Extreme is everything metal and hardcore. Fringe is everything alternative, synth, post-punk, shoegaze, and the strange lands in between. We exist for artists doing serious work at the edges of music who get almost no press for doing it.',
  	\`subscribe_heading\` text DEFAULT 'Get the next one in your inbox.',
  	\`subscribe_sub\` text DEFAULT 'No spam, no algorithm, no filler. Just the records worth your time.',
  	\`contact_email\` text,
  	\`footer_blurb\` text DEFAULT 'A digital space for the extreme and the fringe. Founded 2026 by Seph Hawkins.',
  	\`legal\` text DEFAULT '© 2026 P4LEHORSE. Masthead engraving in the public domain. Typeface: Alte Haas Grotesk by Yann Le Coroller.',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "tagline", "meta_description", "home_heading", "home_lede", "subscribe_heading", "subscribe_sub", "contact_email", "footer_blurb", "legal", "updated_at", "created_at") SELECT "id", "tagline", "meta_description", "home_heading", "home_lede", "subscribe_heading", "subscribe_sub", "contact_email", "footer_blurb", "legal", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`section\` text DEFAULT 'extreme';`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_section\` text DEFAULT 'extreme';`)
  await db.run(sql`ALTER TABLE \`genres\` ADD \`section\` text DEFAULT 'extreme' NOT NULL;`)
}
