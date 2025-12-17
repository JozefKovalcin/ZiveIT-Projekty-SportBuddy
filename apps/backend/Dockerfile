# Unified Dockerfile for Backend (Development & Production)
# Usage:
#   Development: docker-compose up (uses 'development' target)
#   Production: docker build --target production -t sportbuddy-backend .

FROM node:24-alpine AS base
RUN apk add --no-cache openssl libc6-compat && \
    corepack enable && corepack prepare pnpm@latest --activate && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Stage 2: Development (hot reload with volume mounts)
FROM base AS development
COPY package.json pnpm-lock.yaml* ./
COPY prisma.config.ts ./
COPY prisma ./prisma/
EXPOSE 3001
CMD ["sh", "-c", "pnpm install && pnpm exec prisma generate && pnpm exec prisma migrate deploy && pnpm run dev"]

# Stage 3: Build for production
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# Stage 4: Production runtime
FROM base AS production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
