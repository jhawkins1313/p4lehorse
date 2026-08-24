# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                     # runs migrations first (predev), then Next dev on :3000
npm run seed                    # migrate, then create the admin user and sample content
npm run build                   # production build; runs migrations during prerender
npm run migrate                 # apply pending migrations
npm run migrate:create <name>   # generate a migration after a schema change
npm run generate:types          # regenerate src/payload-types.ts
npx tsc --noEmit                # the only working check in the repo
```

There is no test suite and no linter. `npm run lint` is a dead script: Next 16 removed
`next lint`, and no ESLint config or dependency exists, so it fails with
`no such directory: ...\lint`. Use `npx tsc --noEmit` to verify a change compiles.

`npm run seed` is safe to re-run; it skips anything that already exists. It creates
`seph@p4lehorse.com` with password `changeme-p4lehorse`.

Site at `http://localhost:3000`, editor at `/admin`.

## Architecture

One Next.js 16 app. Payload 3 mounts inside it, so there is no separate backend process and
no external CMS.

- `src/app/(frontend)/` the public site
- `src/app/(payload)/` admin UI, REST and GraphQL. Payload generates these. Do not rename or
  restructure them.
- `src/payload.config.ts` the single source of truth for collections, globals and the adapter.

Data flows one way. Front-end pages call helpers in `src/lib/queries.ts`, which reach Payload
through `payloadClient()` in `src/lib/site.ts` (the local API, in process). Pages never call
the REST API over HTTP.

### The migration contract

`push: false` and `prodMigrations` are both set in `src/payload.config.ts` on purpose. Dev runs
the same migrations production runs, so there is one schema path and no drift between a local
database and the server's. The cost is a required step after every schema change:

1. Edit the collection in `src/collections/`.
2. `npm run migrate:create <short-name>`
3. Add the import and the array entry to `src/migrations/index.ts` by hand. The generator does
   not do this for you.
4. Commit the migration files and the index together.

Skipping step 3 is the one reliable way to break a deploy. The container boots against a schema
that does not have the new column, and nothing warns you at build time.

### Collection naming

The collection slug is `posts` and the route is `/posts/[slug]`, but it is labelled "Article"
throughout the admin UI and the README calls them Articles. In code it is always `posts`.

### Access control shapes the queries

`Users` is closed to unauthenticated reads so staff email addresses cannot be scraped off the
REST API. A consequence: an anonymous `find` on posts leaves `author` as a bare id.
`attachAuthors()` in `queries.ts` re-fetches authors with `overrideAccess: true` and attaches
only `id`, `name`, `bio`, `avatar`. Any new query that needs a byline has to run through it.

Front-end queries pass `overrideAccess: false` and filter on `_status: 'published'`. Keep both
when adding a query or drafts leak to the public.

Query helpers return loosely typed docs deliberately. Payload types every relationship as
`id | Doc` and the front end always fetches with depth, so narrowing at each call site would
add noise without adding safety.

### Adding a rich text block

Three places, all required:

1. Define it in `src/blocks/`.
2. Register it in the `BlocksFeature` list in `src/collections/Posts.ts`.
3. Add a converter in `src/components/RichText.tsx`, keyed by the block slug.

A block that misses step 3 renders as nothing.

## Constraints the code enforces

Brand rules that were easy to break by hand, so the code holds them instead. Do not work
around them.

**No em dashes in copy.** `noEmDash` in `src/fields/slug.ts` is a `validate` on every
user-facing copy field: titles, excerpts, album titles, pull quotes, page ledes, site settings.
It rejects en dashes too. The single exception is the `<title>` tag, which the brand meta spec
writes as `{Album Title} — {Artist} | P4LEHORSE`. Body copy never gets one.

**Bandcamp player colors live in one function.** Iframes cannot inherit CSS, so the palette
travels in the `bgcol` and `linkcol` URL parameters. `bandcampEmbedSrc()` in `src/lib/site.ts`
builds them from the token values. Editors supply an album id and nothing else. Never hardcode
a color into an embed.

**There is no rating field, anywhere.** By design. The About page rules out numerical scores
and star ratings, the schema has nowhere to put one, and the review JSON-LD in
`src/app/(frontend)/posts/[slug]/page.tsx` deliberately omits `reviewRating`. There is no news
format either, for the same reason.

**Album art is framed in `#3A3A42`, never magenta**, because cover colors are unpredictable.
That lives in `.ph-cover` and `.ph-feature__art` in `src/styles/site.css`.

**Buttons are black text on magenta.** White on magenta measures 3.20:1 and fails AA.

Magenta is the only chromatic color in the interface. The retired gold palette appears nowhere
in this repo and should not come back.

### Styles

`src/styles/p4lehorse-tokens.css` and `p4lehorse-components.css` are brand kit files. Treat them
as read-only; the only local change is the `@font-face` paths. Anything the site needs on top
goes in `site.css`, which introduces no new colors, no second typeface and no new radii.

Alte Haas Grotesk carries 264 glyphs, with no Romanian, Polish, Czech, Hungarian, Turkish,
Cyrillic or Greek. Band names in these scenes hit those gaps constantly, and the fallback stack
in `p4lehorse-tokens.css` is what catches them. The visible mismatch in a headline is the
correct outcome. Never strip an artist's diacritics to make the type behave.

## Deploying

Pushing to `main` is a deploy. `.github/workflows/build.yml` builds the image to GHCR and
Watchtower on the server pulls it within about five minutes. There is no other confirmation
step.

`NEXT_PUBLIC_SERVER_URL` has to be correct at build time, not only at runtime. Next resolves
`metadataBase`, `sitemap.xml`, `robots.txt` and the RSS channel link while prerendering and
bakes absolute URLs into the output, so setting the env var on the container afterwards does not
correct them. It is a Docker build arg defaulting to `https://p4lehorse.com`, and the workflow
passes it explicitly. If the host ever changes, change it in both places.

This fails silently. Nothing errors; the pages just serve `http://localhost:3000/...` as their
`og:image`, which every social scraper will fail to fetch. Check with:

```bash
curl -s https://<host>/robots.txt | grep Sitemap
```

Everything worth backing up on the server is in `/srv/apps/p4lehorse-data`: one SQLite file and
the media directory.
