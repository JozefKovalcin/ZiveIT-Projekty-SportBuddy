# SportBuddy

Moderná webová aplikácia pre športových nadšencov - hľadanie spoluhráčov, organizácia športových aktivít a prehľad športovísk.

## Technológie

**Frontend:** Next.js (latest), React (latest), TypeScript (latest), Tailwind CSS (latest)
**Backend:** Next.js API Routes, Prisma ORM (latest), Better Auth (latest), PostgreSQL (latest)
**DevOps:** Docker & Docker Compose, Node.js (alpine), npm Workspaces

> **Poznámka:** Všetky verzie používajú latest Alpine Linux images a npm packages pre najnovšie stabilné vydania.

---

## Rýchly štart

### Predpoklady
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (najnovšia verzia)
- Git
- Ideálne WSL2 (Docker Engine nech beží tiež na WSL2)

### Inštalácia (3 kroky)

```bash
# 1. Klonuj projekt
git clone https://github.com/your-username/sportbuddy.git
cd sportbuddy

# 2. Spusti Docker Compose (automaticky stiahne dependencies a spustí všetky služby)
docker-compose up -d

# 3. Otvor aplikáciu v prehliadači
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
```

Prvé spustenie trvá ~1-2 minúty (sťahovanie images + npm install).

---

## Pre vývojárov

### Pri prvom spustení?

1. **Docker stiahne images:**
   - `postgres:alpine` (databáza)
   - `node:alpine` (Node.js runtime)

2. **Backend automaticky:**
   - Nainštaluje npm dependencies
   - Vygeneruje Prisma Client
   - Vytvorí databázové tabuľky (`prisma db push`)
   - Spustí development server na porte **3001**

3. **Frontend automaticky:**
   - Nainštaluje npm dependencies
   - Spustí development server na porte **3000**

4. **PostgreSQL:**
   - Vytvorí databázu `sportbuddy`
   - Beží na porte **5432**

### Hot Reload (automatické načítanie zmien)

Vďaka **volume mounts** - okamžitý hot reload:

```
Zmeníš súbor → Uložíš (Ctrl+S) → Zmena sa okamžite prejaví v prehliadači
```

Nemusíš reštartovať Docker kontajnery!

---

## Docker príkazy pre development

```bash
# Spustenie všetkých služieb
docker-compose up -d

# Sledovanie logov (užitočné pre debugging)
docker-compose logs -f
docker-compose logs -f backend    # len backend
docker-compose logs -f frontend   # len frontend

# Rebuild po zmene Dockerfile
docker-compose up -d --build

# Zastavenie služieb
docker-compose down

# Vyčistenie všetkého (vrátane databázy!)
docker-compose down -v

# Exec do kontajnera (pre manuálne príkazy)
docker-compose exec backend sh
docker-compose exec frontend sh

# Prisma Studio (GUI pre databázu)
docker-compose exec backend npx prisma studio
# Otvor: http://localhost:5555
```

---

## Štruktúra projektu

```
sportbuddy/
├── apps/
│   ├── backend/              # Backend API (Next.js + Prisma)
│   │   ├── src/
│   │   │   ├── app/api/      # API endpoints
│   │   │   └── lib/          # Server utilities (auth, prisma)
│   │   ├── prisma/
│   │   │   └── schema.prisma # Databázová schéma
│   │   ├── Dockerfile        # Unifikovaný Docker image (dev + prod)
│   │   └── package.json
│   │
│   └── frontend/             # Frontend UI (Next.js + React)
│       ├── src/
│       │   ├── app/          # Next.js App Router stránky
│       │   ├── components/   # React komponenty
│       │   └── contexts/     # React Context (theme, atď.)
│       ├── Dockerfile        # Unifikovaný Docker image (dev + prod)
│       └── package.json
│
├── packages/
│   └── shared/               # Zdieľané TypeScript typy
│       └── src/types/        # SportType, SkillLevel, atď.
│
├── docker-compose.yml        # Docker konfigurácia
├── .env                      # Environment variables (lokálne, NIE v Gite!)
├── .env.example              # Template (commituj do Gitu)
├── README.md                 # Návod na používanie
└── USER_STORIES.md           # Prehľad user stories a taskov
```

---

## Environment Variables

### Konfigurácia (.env súbor)

Projekt používa jeden `.env` súbor v roote. **Pre produkčný build `.env` do Gitu! necommitovať**

### Premenné v .env:

```properties
# PostgreSQL
POSTGRES_USER=sportbuddy
POSTGRES_PASSWORD=sportbuddy123
POSTGRES_DB=sportbuddy

# Backend
DATABASE_URL="postgresql://sportbuddy:sportbuddy123@postgres:5432/sportbuddy"
BETTER_AUTH_SECRET="change-this-in-production"
BETTER_AUTH_URL="http://localhost:3001"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"

# OAuth (voliteľné)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## Development workflow

### 1. Práca na user stories

Pozri [USER_STORIES.md](USER_STORIES.md) pre aktuálny stav projektu a zoznam taskov.

### 2. Práca s databázou (Prisma)

```bash
# Zmena schémy (prisma/schema.prisma)
# → Potom spusti:
docker-compose exec backend npx prisma db push

# Otvor Prisma Studio (GUI)
docker-compose exec backend npx prisma studio

# Reset databázy (POZOR: vymaže všetky dáta!)
docker-compose exec backend npx prisma db push --force-reset
```

### 3. Debugging

```bash
# Backend logy (API requesty, errory)
docker-compose logs -f backend

# Frontend logy (build output, errors)
docker-compose logs -f frontend

# Databáza logy
docker-compose logs -f postgres
```

### 4. Pridávanie nových dependencies

```bash
# Backend
docker-compose exec backend npm install <package>
# Potom restart
docker-compose restart backend

# Frontend
docker-compose exec frontend npm install <package>
# Potom restart
docker-compose restart frontend
```

**Tip:** Po `npm install` v kontajneri, zmeň aj `package.json` lokálne a commitni ho.

---

## Docker architektúra

### Unifikované Dockerfiles

Každý Dockerfile má **multi-stage build** s dvoma režimami:

- **Development stage** (používa docker-compose.yml)
  - Hot reload cez volume mounts
  - `npm run dev`
  - Debug-friendly

- **Production stage** (pre nasadenie)
  - Optimalizovaný build
  - Multi-stage image (menší size)
  - `npm run build`

### Ako to funguje?

```yaml
# docker-compose.yml používa 'development' target
backend:
  build:
    context: ./apps/backend
    target: development  # ← Development režim
```

### Produkčný build (pre nasadenie)

```bash
# Backend
cd apps/backend
docker build --target production -t sportbuddy-backend .

# Frontend
cd apps/frontend
docker build --target production -t sportbuddy-frontend .
```

---

## Pre vývojárov - Best Practices

### ✅ Commituj:
- Všetok kód v `apps/*/src/`
- `package.json`, `package-lock.json` (po pridaní dependencies)
- `prisma/schema.prisma` (po zmene schémy)
- `Dockerfile`, `docker-compose.yml`
- `.env.example` (template bez secrets)

### ❌ Necommituj:
- `node_modules/` (automaticky ignorované)
- `.env` (vývojarská verzia áno, produkčná dať do secrets!)
- `.vscode/`, `.idea/` (IDE nastavenia)

### 🔄 Po každom git pull:

```bash
# Ak niekto zmenil Dockerfile alebo dependencies
docker-compose down
docker-compose up -d --build
```

### 🐛 Keď niečo nefunguje:

```bash
# 1. Skús restart
docker-compose restart

# 2. Skús rebuild
docker-compose up -d --build

# 3. Vyčisti všetko a začni odznova
docker-compose down -v
docker-compose up -d --build

# 4. Skontroluj logy
docker-compose logs -f
```

---

## Ďalšie kroky

1. **Prečítaj si** [USER_STORIES.md](USER_STORIES.md) - zoznam všetkých user stories a ich stav
2. **Vyber si task**
3. **Pozri databázovú schému** - `apps/backend/prisma/schema.prisma`
4. **Pozri API - backend** - `apps/backend/src/app/api/`

---

## Oficiálna dokumentácia

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Docker Docs](https://docs.docker.com/)

---

## Kontakt

Pre otázky ohľadom projektu kontaktuj tím alebo otvor issue v repozitári.
