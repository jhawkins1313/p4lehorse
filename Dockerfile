# syntax=docker/dockerfile:1
# ---------------------------------------------------------------------------
# P4LEHORSE — production image
#
# Multi-stage so the runner carries no toolchain and no dev dependencies.
# Next builds in standalone mode, which traces exactly the node_modules the
# server needs. Final image lands around 400 MB, most of it sharp and the
# SQLite driver.
#
# The image contains no database and no media. Both live on the host at
# /srv/apps/p4lehorse-data, bind-mounted to /data, so recreating the container
# never touches content.
# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
WORKDIR /app

# --- deps -------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- build ------------------------------------------------------------------
FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# These two only need to be present, not correct. Nothing about them survives
# into the image: the secret is never read at build, and the database here is a
# throwaway that Payload migrates just so pages can render against real tables.
ENV PAYLOAD_SECRET=build-time-placeholder
ENV DATABASE_URI=file:/tmp/build.db

# This one is different, and getting it wrong is silent. Next resolves
# metadataBase, sitemap.xml, robots.txt and the RSS channel link at BUILD time
# and bakes the absolute URLs into the prerendered output. A runtime env var
# cannot fix them afterwards. Point it at the real public origin, or every
# og:image a scraper sees will be a localhost URL.
ARG NEXT_PUBLIC_SERVER_URL=https://p4lehorse.com
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

# Migrate first, in one process, on purpose.
#
# Next prerenders with several workers and each one initialises Payload, which
# means each one checks for pending migrations. Against a single empty SQLite
# file they race, and the loser dies on "table posts already exists". It is
# intermittent: the build passes or fails depending on which worker gets there
# first. Applying the migration up front leaves nothing pending, so every worker
# no-ops and the race cannot happen.
RUN npx payload migrate && npm run build

# --- runtime ----------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Bind to every interface. The Cloudflare Tunnel reaches this container by
# service name over the shared Docker network, so 127.0.0.1 would be invisible.
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URI=file:/data/p4lehorse.db
ENV MEDIA_DIR=/data/media

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Everything mutable lives here and nowhere else. Mount it or lose it.
RUN mkdir -p /data/media && chown -R node:node /data /app
VOLUME ["/data"]

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "server.js"]
