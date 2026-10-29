# P4LEHORSE

The site and the CMS behind it, in one Next.js app.

Payload 3 mounts inside the same Next project, so `/` is the public site and `/admin` is the
editor. One repo, one container, one deploy. There is no separate backend to run and no
external CMS to log into.

Stack: Next.js 16 (App Router), Payload 3, SQLite, Alte Haas Grotesk. Built on the
P4LEHORSE brand kit v1.1.

---

## Run it locally

```bash
npm install
cp .env.example .env          # then set PAYLOAD_SECRET to anything long
npm run seed                  # migrates, then adds an admin user and sample content
npm run dev
```

Site at `http://localhost:3000`, editor at `http://localhost:3000/admin`.

The seed creates `seph@p4lehorse.com` with the password `changeme-p4lehorse`. Change it the
first time you sign in, or set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` before seeding.

`npm run seed` is safe to re-run. It skips anything that already exists.

### Schema changes

Development runs the same migrations production does, so there is one schema path and no
drift. After changing a collection:

```bash
npm run migrate:create <short-name>
```

Then add the new file to the list in `src/migrations/index.ts` and commit both. Payload runs
pending migrations itself on startup, at build time and in the container, so nothing else has
to happen at deploy.

Skipping this step is the one way to break a deploy: the container will boot against a schema
that does not have your new column.

---

## How content is modeled

| Collection | What it holds |
|---|---|
| **Articles** | Every piece. Five formats: review, interview, feature, retrospective, roundup. |
| **Artists** | Bands and solo acts. Each gets a page listing everything written about them. |
| **Genres** | Tags, sentence case. |
| **Media** | Uploads. Four derived sizes are generated on upload. |
| **Pages** | About, Submit music, and anything else standing. |
| **Subscribers** | Newsletter list. Write-only from outside. |
| **Users** | Writers, editors, admins. |

An article's fields sit in three tabs. **Article** is the headline, excerpt and body.
**Record** is the album metadata, and reviews are the only format that needs it. **Bandcamp**
is the album ID and pull quote for the player block.

Drafts autosave. Publishing is a separate action, so nothing goes live by accident. Set
`publishedAt` to a future time to schedule a piece.

### There is no rating field

By design, and it should stay that way. The About page rules out numerical scores and star
ratings, so the schema has nowhere to put one and the review JSON-LD deliberately omits
`reviewRating`. There is no news feed either, for the same reason.

---

## Brand rules the code enforces

Four things in the brand kit are easy to break by hand, so the code holds them instead.

**Bandcamp player colors.** Bandcamp iframes cannot inherit CSS. The palette travels in two
URL parameters, `bgcol` and `linkcol`, and the kit warns that every embed has to be checked
by hand. Here it is built once in `src/lib/site.ts` from the token values, so no editor ever
types a color and no embed can drift. Editors paste an album ID; that is all.

**No em dashes.** House style, and a `validate` on every copy field rejects them with a note
explaining why. Titles, excerpts, pull quotes, page ledes, site settings.

**Album art is framed in neutral.** `#3A3A42`, never magenta, because cover colors are
unpredictable. That lives in `.ph-cover` and `.ph-feature__art` in `src/styles/site.css`.

**Buttons are black text on magenta.** White on magenta measures 3.20:1 and fails AA. That
comes straight from the kit's `components.css` and nothing here overrides it.

The retired gold palette the kit tells you to grep for appears nowhere in this repo. Magenta
is the only chromatic color in the interface, and the cyan cast in the masthead engraving
belongs to that image, not to the UI.

The one place an em dash survives is the `<title>` tag, because the kit's own meta spec
writes it that way: `{Album Title} — {Artist} | P4LEHORSE`. Body copy never gets one.

### Diacritics

Alte Haas Grotesk carries 264 glyphs. No Romanian, Polish, Czech, Hungarian, Turkish,
Cyrillic or Greek. Band names in these scenes hit those gaps constantly, and the fallback
stack in `p4lehorse-tokens.css` is what catches them. The mismatch is visible in a headline
and that is the correct outcome. Never strip an artist's diacritics to make the type behave.

---

## Layout

```
src/
  app/
    (frontend)/     the public site
    (payload)/      the admin mount, do not rename these files
    api/subscribe/  newsletter signup
  collections/      Payload schema
  blocks/           Bandcamp and pull quote, droppable into any article body
  components/       React components for the front end
  lib/              queries, formatting, the Bandcamp URL builder
  styles/           brand kit CSS, unmodified except for the font paths
  seed/             starter content
public/
  fonts/ images/ logo/    straight from the brand kit
```

`src/styles/p4lehorse-tokens.css` and `p4lehorse-components.css` are the brand kit files.
The only change made to them is the `@font-face` paths, now pointing at `/fonts`. Treat them
as read-only: anything the site needs on top goes in `site.css`, which introduces no new
colors, no second typeface, and no new radii.

---

## Deploying to owensfamily

The pipeline is push to main, GitHub Actions builds the image to GHCR, Watchtower pulls it
within five minutes.

1. **Data directory**, once:

   ```bash
   sudo mkdir -p /srv/apps/p4lehorse-data/media /srv/apps/p4lehorse
   sudo chown -R 1000:1000 /srv/apps/p4lehorse-data
   ```

2. **Env file** at `/srv/apps/p4lehorse/.env`. Copy `.env.example` and set:

   ```
   PAYLOAD_SECRET=<openssl rand -hex 32>
   NEXT_PUBLIC_SERVER_URL=https://p4lehorse.com
   ```

   Leave `DATABASE_URI` and `MEDIA_DIR` alone; the compose file pins both.

3. **Service.** Add the `p4lehorse` service from `docker-compose.yml` to the `cloudflared`
   stack, or deploy it standalone. No host ports. It joins `cloudflared_default` and the
   tunnel reaches it at `http://p4lehorse:3000`.

4. **Tunnel ingress and DNS** for the hostname, pointing at `http://p4lehorse:3000`.

5. **First run** migrates the empty database itself and shows the create-first-user screen at
   `/admin`. Nothing else to do.

The image is public on GHCR, so the server needs no pull credentials. Pin a version tag in
compose if you want to stop auto-deploys.

### Backups

Everything worth keeping is in `/srv/apps/p4lehorse-data`: one SQLite file and the media
directory. Copy that directory and you have copied the site.

---

## Environment variables

| Variable | Purpose |
|---|---|
| `PAYLOAD_SECRET` | Signs auth cookies. Changing it logs everyone out. |
| `DATABASE_URI` | SQLite file. `file:/data/p4lehorse.db` in production. |
| `MEDIA_DIR` | Upload directory. `/data/media` in production. |
| `NEXT_PUBLIC_SERVER_URL` | Public origin. Used for og:image, RSS, sitemap, canonicals. No trailing slash. **Also a build arg, see below.** |
| `PORT` | Internal listen port. Default 3000. |
| `RESEND_API_KEY` | Optional. Without it, mail is logged to the console. |
| `EMAIL_FROM` | Optional. From address for outbound mail. |
| `YOUTUBE_API_KEY` | Optional. Fills the P4LEHORSE PICKS carousel. Without it the block falls back to the snapshot in `src/lib/youtube.ts`. |

### The one that has to be right at build time

`NEXT_PUBLIC_SERVER_URL` is not only a runtime variable. Next resolves `metadataBase`,
`sitemap.xml`, `robots.txt` and the RSS channel link while it prerenders, and bakes the
absolute URLs into the output. Setting the env var on the container afterwards does not
correct them.

So it is a Docker build arg, defaulting to `https://p4lehorse.com`, and the Actions workflow
passes it explicitly. If the site ever moves, change it in **both** places and rebuild.

This fails silently. Nothing errors; the pages just serve `http://localhost:3000/...` as their
`og:image`, which every social scraper will fail to fetch. After any change to the hostname,
check:

```bash
curl -s https://<host>/robots.txt | grep Sitemap
```

---

## The PICKS playlist

The block at the foot of the homepage. It shows the playlist cover, two links out, and a
carousel of the fifteen most recent additions drifting past. It replaced the single Bandcamp
Pick that used to sit there: one album is a recommendation, a playlist is a rotation and it
is something a reader can subscribe to. The Bandcamp player itself is untouched and still
runs inside articles.

**Settings, Site settings, Playlist** holds the heading, the link and the playlist id. That
is all of it. The carousel fills itself and the artwork is committed, so there is nothing to
upload and nothing to keep in step.

### The artwork is in the repo, not the Media library

`public/images/p4lehorse-picks-cover-480.jpg`, referenced by a constant in
`PlaylistPicks.tsx`. It began as an upload field falling back to the newest sleeve in the
run, which meant a fresh deploy showed somebody's album cover until a human remembered to
upload the real artwork into the *production* Media library, a different database from any
local one. The cover is fixed branding rather than editorial, so it belongs with the code
that renders it. Replacing it is a file swap and a deploy.

It is 480x480, which is the largest YouTube will part with, and it drives a 300px slot. On a
high density display it is slightly soft. If the original artwork turns up, drop it in beside
this one and point the constant at it.

### Setting up the API key

One step, which does not block a deploy. The block renders without it.

Make a key in the Google Cloud Console, enable "YouTube Data API v3", and
restrict the key to that one API. Put it in the server's `.env` as `YOUTUBE_API_KEY`. The
playlist is public, so there is no OAuth and nothing to authorise. Unlike
`NEXT_PUBLIC_SERVER_URL` this is runtime only: the carousel refetches on the page's own
revalidate, so it does not go in the Dockerfile or the workflow.

Without a key, and any time the call fails, the carousel falls back to a snapshot of the
playlist hardcoded in `src/lib/youtube.ts`. That is deliberate, because the image build
prerenders the homepage in a container that has no key and a stale carousel beats an empty
one. The cost is that the snapshot only changes when somebody edits that file.

### Changing the playlist

Paste the new share link into **Playlist URL** and put the part after `list=` into
**Playlist ID**. Drop the `si=` tracking parameter. Nothing else needs touching, though the
snapshot in `src/lib/youtube.ts` will still describe the old playlist until it is replaced.

Covers come from YouTube's thumbnails and are cropped to the sleeve by `.ph-picks__frame--yt`
in `site.css`. The comment there explains the scale factor, which is not a magic number and
should not be adjusted by eye.

---

## If you outgrow SQLite

SQLite was chosen because the box is a 16 GB laptop already running about ten containers, and
a publication's read traffic is a poor reason to run a database server. Swapping to Postgres
means: install `@payloadcms/db-postgres`, replace `sqliteAdapter` in `src/payload.config.ts`
with `postgresAdapter`, point `DATABASE_URI` at the new server, and regenerate the initial
migration. Every collection stays exactly as it is. Neon is already in use for other projects
on this server if you would rather not run another container.

---

## Next steps

Upload cover art for the seeded articles and the card grids fill in. Add the real social
links under Settings, Site settings, Elsewhere. Put `YOUTUBE_API_KEY` in the server's `.env`
so the PICKS carousel reads the live playlist. Then write something.
