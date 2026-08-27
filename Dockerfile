# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-bookworm-slim

FROM ${NODE_IMAGE} AS node-base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN apt-get update \
    && apt-get install --yes --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@11.17.0 \
    && npm cache clean --force

WORKDIR /app

FROM node-base AS build

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm build

FROM node-base AS api

ENV NODE_ENV=production

COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/.data && chown node:node /app/.data

USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=4 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/v1/health').then((response) => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"]

CMD ["node", "apps/api/dist/main.js"]

FROM caddy:2-alpine AS web

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/apps/web/dist /srv

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=4 \
  CMD ["wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1/"]
