# Builds the static export and serves it from nginx — for `docker compose up`
# on your own server. Hosting on Cloudflare Pages / Vercel / Netlify instead
# needs none of this; point them at `npm run build` with an output dir of `out`.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/out /usr/share/nginx/html
COPY deploy/docker-nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
