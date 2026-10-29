import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`tagline\` text DEFAULT 'A digital space for the extreme and the fringe.',
  	\`meta_description\` text DEFAULT 'A digital space for the extreme and the fringe. Album reviews, interviews, and scene features covering the metal, hardcore, synth, post-punk and shoegaze artists the industry overlooks.',
  	\`home_heading\` text DEFAULT 'A digital space for the extreme and the fringe.',
  	\`home_lede\` text DEFAULT 'Album reviews and interviews covering metal, hardcore, synth, post-punk, shoegaze, and the strange lands in between. We exist for artists doing serious work at the edges of music who get almost no press for doing it.',
  	\`playlist_heading\` text DEFAULT 'P4LEHORSE PICKS',
  	\`playlist_url\` text DEFAULT 'https://music.youtube.com/playlist?list=PLKV3QunHgQOQ',
  	\`playlist_id\` text DEFAULT 'PLKV3QunHgQOQ',
  	\`subscribe_heading\` text DEFAULT 'Get the next one in your inbox.',
  	\`subscribe_sub\` text DEFAULT 'No spam, no algorithm, no filler. Just the records worth your time.',
  	\`contact_email\` text,
  	\`footer_blurb\` text DEFAULT 'A digital space for the extreme and the fringe. Founded 2026 by Seph Hawkins.',
  	\`legal\` text DEFAULT '© 2026 P4LEHORSE. Masthead engraving in the public domain. Typeface: Alte Haas Grotesk by Yann Le Coroller.',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "tagline", "meta_description", "home_heading", "home_lede", "playlist_heading", "playlist_url", "playlist_id", "subscribe_heading", "subscribe_sub", "contact_email", "footer_blurb", "legal", "updated_at", "created_at") SELECT "id", "tagline", "meta_description", "home_heading", "home_lede", "playlist_heading", "playlist_url", "playlist_id", "subscribe_heading", "subscribe_sub", "contact_email", "footer_blurb", "legal", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`playlist_blurb\` text DEFAULT 'What is actually on while the next reviews get written. Metal, hardcore, synth and the stranger edges, updated as records land.';`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`playlist_cover_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`site_settings_playlist_cover_idx\` ON \`site_settings\` (\`playlist_cover_id\`);`)
}
