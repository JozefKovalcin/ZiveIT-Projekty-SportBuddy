# Unified Dockerfile for Frontend (Development & Production)
# Usage:
#   Development: docker-compose up (uses 'development' target)
#   Production: docker build --target production -t sportbuddy-frontend .

FROM node:alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Stage 2: Development (hot reload with volume mounts)
FROM base AS development
COPY package*.json ./
RUN npm install --legacy-peer-deps
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Build for production
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 4: Production runtime
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
