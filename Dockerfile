# Build runs on CI, not on the VPS. Copy only Next's traced runtime files.
FROM docker.io/library/node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
# postinstall/prepare require the MDX config and sources, so run after COPY.
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run postinstall && npm run prepare \
  && npx --no-install eslint src/lib/mcp-docs.ts src/app/api/mcp/route.ts src/app/healthz/route.ts scripts/build.mjs scripts/smoke-mcp.mjs \
  && npm run types:check && npm run build

FROM docker.io/library/node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
