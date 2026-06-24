# SportBuddy

SportBuddy is a full-stack web application for organizing local sports activities. It helps users discover nearby games, create activities, manage participation, chat with other players, review participants, and use AI-assisted search or activity creation in Slovak.

This repository is structured as a small monorepo with separate Next.js applications for the frontend and backend, a PostgreSQL database managed by Prisma, and Docker Compose for local development.

## Highlights

- Activity discovery with filtering by sport, skill level, location, date, age range, price, and gender preference.
- Activity creation flow with recurring activities, venue/location support, calendar export, and participant management.
- User authentication, profile editing, public profiles, ratings, password reset by email, and user blocking.
- In-app notifications, activity chat with polling, and notification preferences.
- AI-assisted natural language search and activity creation powered by Google Gemini.
- Dockerized local environment with PostgreSQL, frontend, and backend services.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Prisma ORM, Better Auth, PostgreSQL
- Shared package: TypeScript types and validation helpers
- Integrations: Google Maps, Google Gemini, Brevo email, Web Push
- DevOps: Docker, Docker Compose, pnpm

## Architecture

```text
apps/
  backend/      Next.js API application, Prisma schema, auth, email, AI, uploads
  frontend/     Next.js UI application, PWA assets, reusable components
  postgres/     Custom PostgreSQL Docker image setup
packages/
  shared/       Shared TypeScript exports and domain types
```

The frontend talks to the backend through `NEXT_PUBLIC_API_URL`. The backend owns authentication, database access, file upload serving, email delivery, AI calls, notifications, and Prisma migrations.

## Getting Started

### Prerequisites

- Git
- Docker Desktop with Docker Compose
- Node.js 20+ and pnpm, only if you want to run services outside Docker

### Local Setup

```bash
git clone https://github.com/JozefKovalcin/ZiveIT-Projekty-SportBuddy.git
cd ZiveIT-Projekty-SportBuddy

cp .env.example .env
docker compose up -d --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- PostgreSQL: localhost:5432

The backend container generates the Prisma client and applies existing migrations during startup.

## Environment Variables

Copy `.env.example` to `.env` and fill only the integrations you need. The app can run locally without optional OAuth, email, Maps, or AI keys, but those features will be disabled or limited.

Important variables:

- `DATABASE_URL` - PostgreSQL connection string used by Prisma.
- `BETTER_AUTH_SECRET` - random 32+ character secret for auth.
- `BETTER_AUTH_URL` - backend URL, usually `http://localhost:3001`.
- `NEXT_PUBLIC_API_URL` - frontend-to-backend API URL.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - enables map/location features.
- `GEMINI_API_KEY` - enables AI search and AI activity creation.
- `BREVO_API_KEY` - enables password reset email delivery.
- `BREVO_SENDER_EMAIL` - verified sender used by Brevo.
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, and `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - enable Web Push notifications.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` - optional Google OAuth.

Never commit real secrets. If a real key was ever committed, rotate it in the provider dashboard because deleting it from the repository does not remove it from Git history.

## Useful Commands

```bash
# Start all services
docker compose up -d

# Rebuild containers after dependency or Dockerfile changes
docker compose up -d --build

# Follow logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Open Prisma Studio
docker compose exec backend pnpm exec prisma studio

# Stop services
docker compose down

# Stop services and remove database volume
docker compose down -v
```

## Running Without Docker

Each application owns its dependencies. Install and run them from their own directories:

```bash
cd apps/backend
pnpm install
pnpm exec prisma generate
pnpm run dev

cd ../frontend
pnpm install
pnpm run dev
```

For local non-Docker development, set `DATABASE_URL` to a reachable PostgreSQL instance and keep frontend/backend ports aligned with `.env`.

## Project Structure

```text
apps/backend/src/app/api/     API route handlers
apps/backend/src/lib/         Auth, Prisma, email, AI, notification utilities
apps/backend/prisma/          Prisma schema, migrations, seed script
apps/frontend/src/app/        Next.js App Router pages
apps/frontend/src/components/ Reusable UI and feature components
apps/frontend/src/contexts/   Client-side providers
packages/shared/src/          Shared TypeScript exports
```

## What This Demonstrates

- Building a real multi-service TypeScript application with frontend, backend, database, auth, and external APIs.
- Modeling a relational domain with Prisma migrations and practical API boundaries.
- Implementing production-shaped user flows: authentication, profiles, notifications, chat, ratings, password reset, and uploads.
- Dockerizing a development environment for consistent onboarding.
- Integrating AI features while keeping a manual fallback path.

## Security Notes

This is a portfolio/student project, not an audited production service. The repository intentionally keeps example values in `.env.example`, but real API keys, VAPID keys, OAuth secrets, uploaded user files, and production credentials must remain outside Git.

Runtime uploads are ignored by Git and should be stored in durable object storage for a production deployment.

## Current Limitations

- The frontend and backend are separate Next.js apps rather than a single deployed platform.
- Real-time chat uses polling instead of WebSockets.
- Some optional integrations require external provider setup.
- Production deployment would need stronger secret management, persistent upload storage, monitoring, and provider-specific configuration.

## License

No license file is currently included. Treat the code as all rights reserved unless a license is added.
