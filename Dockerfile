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

# The build imports payload.config.ts, which reads these. They only need to be
# present, not correct: nothing is baked into the output. Real values arrive as
# runtime env vars from /srv/apps/p4lehorse/.env.
ENV PAYLOAD_SECRET=build-time-placeholder
ENV DATABASE_URI=file:/tmp/build.db
ENV NEXT_PUBLIC_SERVER_URL=http://localhost:3000

RUN npm run build

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
