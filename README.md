# SportBuddy

[![CI](https://github.com/JozefKovalcin/sportbuddy-fullstack-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/JozefKovalcin/sportbuddy-fullstack-ai/actions/workflows/ci.yml)

SportBuddy is a full-stack web application for organizing local sports activities. Users can discover nearby games, create activities, manage participation, chat with other players, review participants and venues, and use AI-assisted search or activity creation in Slovak.

This is a team portfolio/student project built as a small monorepo with separate Next.js frontend and backend applications, PostgreSQL managed by Prisma, and Docker Compose for local development.

## Competition Context

SportBuddy reached the Top 20 at Zive IT projekty 2026, a Slovak student project competition. The project is presented here as a practical full-stack application with real user flows, external integrations, and Dockerized local setup.

## Features

- Activity discovery with filters for sport, skill level, location, date, age range, price, and gender preference.
- Activity creation with recurring activities, venue/location support, calendar export, and participant management.
- Authentication, profile editing, public profiles, ratings, password reset by email, and user blocking.
- In-app notifications, activity chat with polling, and notification preferences.
- AI-assisted natural language search and activity creation powered by Google Gemini.
- Dockerized local environment with PostgreSQL, frontend, and backend services.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API routes, Prisma ORM, Better Auth, PostgreSQL
- Shared package: TypeScript types and validation helpers
- Integrations: Google Maps, Google Gemini, Brevo email, Web Push
- DevOps: Docker, Docker Compose, pnpm, GitHub Actions

## Architecture

```text
apps/
  backend/      Next.js API app, Prisma schema, auth, email, AI, uploads
  frontend/     Next.js UI app, PWA assets, reusable components
  postgres/     PostgreSQL Docker image setup
packages/
  shared/       Shared TypeScript exports and domain types
```

The frontend communicates with the backend through `NEXT_PUBLIC_API_URL`. The backend owns authentication, database access, file upload serving, email delivery, AI calls, notifications, and Prisma migrations.

## Local Setup with Docker

### Prerequisites

- Git
- Docker Desktop with Docker Compose
- Node.js 20+ and pnpm, only if you want to run services outside Docker

### Start the App

```bash
git clone https://github.com/JozefKovalcin/sportbuddy-fullstack-ai.git
cd sportbuddy-fullstack-ai

cp .env.example .env
docker compose up -d --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- PostgreSQL: localhost:5432

The backend container generates the Prisma client and applies existing migrations during startup.

## Environment Variables

Copy `.env.example` to `.env` and fill only the integrations you need. The app can run locally without optional OAuth, email, Maps, AI, or push-notification keys; those features will be disabled, limited, or logged locally depending on the feature.

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

Each application owns its dependencies and lockfile. Install and run them from their own directories:

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

## Screenshots

Screenshot placeholders are tracked in [docs/screenshots/](docs/screenshots/). Recommended screenshots:

- activity discovery and filtering,
- activity detail with participants,
- activity creation flow,
- chat or notification view,
- mobile/PWA view if available.

## My Contribution

This was a team project developed for Zive IT projekty 2026. My main contributions included working on the application structure, database-backed features, local development setup, and selected frontend/backend functionality.

Contributed to the Next.js/TypeScript application structure and reusable full-stack project organization.
Worked with Prisma/PostgreSQL data modeling and database-backed user/activity flows.
Helped implement or integrate activity discovery, activity creation, user profiles, and related application logic.
Worked with Docker-based local setup to make the project easier to run and test consistently.
Participated in preparing the project for the Zive IT projekty 2026 competition, where the project reached the Top 20.

## What This Demonstrates for Employers

- Building a multi-service TypeScript application with frontend, backend, database, auth, and external APIs.
- Modeling a relational domain with Prisma migrations and practical API boundaries.
- Implementing production-shaped user flows: authentication, profiles, notifications, chat, ratings, password reset, and uploads.
- Dockerizing a development environment for consistent onboarding.
- Integrating AI features while keeping manual app flows available when API keys are missing.
- Communicating team-project scope honestly.

## Security Notes and Limitations

This is a portfolio/student project, not an audited production service. The repository intentionally keeps example values in `.env.example`, but real API keys, VAPID keys, OAuth secrets, uploaded user files, and production credentials must remain outside Git.

Runtime uploads are ignored by Git and should be stored in durable object storage for a production deployment. Production deployment would also need stronger secret management, monitoring, rate limiting, backup strategy, and provider-specific hardening.

For reporting security concerns, see [SECURITY.md](SECURITY.md).

## Current Limitations

- The frontend and backend are separate Next.js apps rather than a single deployed platform.
- Real-time chat uses polling instead of WebSockets.
- Some optional integrations require external provider setup.
- Production deployment needs additional operational hardening.

## License

No license file is currently included. Treat the code as all rights reserved unless a license is added.
