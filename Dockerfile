# Builds the site and runs it as a small Node server (Next.js standalone
# output). The marketing pages are prerendered at build time; the server adds
# the collaboration form's API and the admin panel. Submissions live in a
# SQLite file under /data — mount a volume there so they survive updates.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=80 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir -p /data && chown node:node /data
VOLUME /data
# Docker lets unprivileged processes bind low ports inside a container, so the
# server keeps listening on :80 (what the reverse proxy expects) as `node`.
USER node
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1/robots.txt >/dev/null || exit 1
# node:sqlite is stable in practice but still flagged experimental in Node 22.
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
