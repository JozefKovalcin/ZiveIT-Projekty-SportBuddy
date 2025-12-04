# SportBuddy

Moderná webová aplikácia pre športových nadšencov - hľadanie spoluhráčov, organizácia športových aktivít a prehľad športovísk.

## Technológie

**Frontend:** Next.js (latest), React (latest), TypeScript (latest), Tailwind CSS (latest)
**Backend:** Next.js API Routes, Prisma ORM (latest), Better Auth (latest), PostgreSQL (latest)
**DevOps:** Docker & Docker Compose, Node.js (alpine)

> **Poznámka:** Všetky verzie používajú najnovšie Alpine Linux obrazy a npm balíčky pre najnovšie stabilné vydania.

---

## Rýchly štart

### Predpoklady
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (najnovšia verzia)
- Git
- Ideálne WSL2 (Docker Engine nech beží tiež na WSL2)

### Inštalácia (4 kroky)

```bash
# 1. Klonuj projekt
git clone git@git.kemt.fei.tuke.sk:kb159dr/SportBuddy.git
cd sportbuddy

# 2. Skopíruj premenné prostredia (DÔLEŽITÉ!)
cp .env.example .env

# 3. Spusti Docker Compose (automaticky stiahne závislosti a spustí všetky služby)
docker-compose up -d

# 4. Otvor aplikáciu v prehliadači
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
```

Prvé spustenie trvá ~1-2 minúty (sťahovanie obrazov + npm install).

---

## Pre vývojárov

### Pri prvom spustení:

**⚠️ Pred spustením: Uisti sa, že máš `.env` súbor (pozri krok 2 v inštalácii vyššie)**

1. **Docker stiahne obrazy:**
   - `postgres:alpine` (databáza)
   - `node:alpine` (Node.js prostredie)

2. **Backend automaticky:**
   - Nainštaluje npm závislosti
   - Vygeneruje Prisma klienta
   - Vytvorí databázové tabuľky (`prisma db push`)
   - Spustí vývojársky server na porte **3001**

3. **Frontend automaticky:**
   - Nainštaluje npm závislosti
   - Spustí vývojársky server na porte **3000**

4. **PostgreSQL:**
   - Vytvorí databázu `sportbuddy`
   - Beží na porte **5432**

### Automatické načítanie zmien (Hot Reload)

Vďaka **pripojeniu zväzkov (volume mounts)** - okamžité načítanie zmien:

```
Zmeníš súbor → Uložíš (Ctrl+S) → Zmena sa okamžite prejaví v prehliadači
```

Nemusíš reštartovať Docker kontajnery!

---

## Príkazy Docker pre vývoj

```bash
# Spustenie všetkých služieb
docker-compose up -d

# Sledovanie záznamov (užitočné pre ladenie)
docker-compose logs -f
docker-compose logs -f backend    # len backend
docker-compose logs -f frontend   # len frontend

# Opätovné zostavenie po zmene Dockerfile
docker-compose up -d --build

# Zastavenie služieb
docker-compose down

# Vyčistenie všetkého (vrátane databázy!)
docker-compose down -v

# Pripojenie do kontajnera (pre manuálne príkazy)
docker-compose exec backend sh
docker-compose exec frontend sh

# Prisma Studio (grafické rozhranie pre databázu)
docker-compose exec backend npx prisma studio
# Otvor: http://localhost:5555
```

---

## Štruktúra projektu

```
sportbuddy/
├── apps/
│   ├── backend/                    # Backend API (Next.js + Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Databázová schéma
│   │   │   └── seed.ts             # Počiatočné dáta do databázy (športoviská)
│   │   ├── src/
│   │   │   ├── app/api/            # API koncové body
│   │   │   │   ├── activities/     # Activity CRUD + prihlásenie/odhlásenie
│   │   │   │   ├── auth/           # Better Auth koncové body + vlastný reset hesla
│   │   │   │   ├── profile/        # API používateľského profilu
│   │   │   │   └── venues/         # API športovísk
│   │   │   └── lib/                # Serverové utility
│   │   │       ├── auth.ts         # Better Auth konfigurácia
│   │   │       ├── auth-client.ts  # Nastavenie Auth klienta
│   │   │       ├── email.ts        # Brevo emailová služba (na reset hesla)
│   │   │       ├── get-session.ts  # Session helper
│   │   │       └── prisma.ts       # Prisma klient
│   │   ├── Dockerfile              # Multi-stage Docker (dev + prod)
│   │   ├── middleware.ts           # Next.js middleware
│   │   ├── next.config.mjs         # Next.js konfigurácia (CORS hlavičky)
│   │   ├── package.json            # Závislosti
│   │   └── tsconfig.json           # TypeScript konfigurácia
│   │
│   └── frontend/                   # Frontend UI (Next.js + React)
│       ├── public/
│       │   ├── manifest.json       # PWA manifest
│       │   └── sw.js               # Service Worker
│       ├── src/
│       │   ├── app/                # Next.js App Router stránky
│       │   │   ├── auth/           # Autentifikačné stránky (prihlásenie, registrácia)
│       │   │   ├── dashboard/      # Stránka dashboardu
│       │   │   ├── profile/        # Stránky profilu
│       │   │   ├── globals.css     # Globálne štýly
│       │   │   ├── layout.tsx      # Hlavné rozloženie
│       │   │   └── page.tsx        # Domovská stránka
│       │   ├── components/         # React komponenty
│       │   │   ├── ui/             # UI elementy (Button, Card, Input, Select, etc.)
│       │   │   ├── Navigation.tsx  # Navigačný komponent
│       │   │   └── TemplateWrapper.tsx # Wrapper s layoutom
│       │   ├── contexts/
│       │   │   └── GoogleMapsContext.tsx # Google Maps provider
│       │   └── lib/
│       │       └── auth-client.ts  # Better Auth klient
│       ├── Dockerfile              # Viacstupňový Docker (dev + prod)
│       ├── next.config.mjs         # Next.js konfigurácia
│       ├── package.json            # Závislosti
│       ├── postcss.config.mjs      # PostCSS konfigurácia
│       ├── tailwind.config.ts      # Tailwind CSS konfigurácia
│       └── tsconfig.json           # TypeScript konfigurácia
│
├── packages/
│   └── shared/                     # Zdieľané TypeScript typy
│       ├── src/
│       │   ├── types/
│       │   │   └── index.ts        # Zdieľané typy (SportType, SkillLevel, atď.)
│       │   └── index.ts            # Exporty balíčka
│       └── package.json
│
├── .dockerignore                   # Dockerignore
├── .env                            # Premenné prostredia (len lokálne, nie v Gite!)
├── .env.example                    # Šablóna premenných prostredia (commituj toto)
├── .gitignore                      # Gitignore
├── docker-compose.yml              # Docker Compose konfigurácia (3 služby)
├── README.md                       # Projektová dokumentácia
└── USER_STORIES.md                 # User stories & tasky
```

**Poznámka:** V Docker projekte nepotrebujeme root `package.json`, `tsconfig.json` ani `package-lock.json` súbory. Každá aplikácia má vlastné závislosti.

---

## Premenné prostredia

### Konfigurácia (.env súbor)

Projekt používa jeden `.env` súbor v root adresári. **Nikdy necommituj `.env` do Gitu!**

**Pre nových vývojárov:**
```bash
cp .env.example .env
```

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
BREVO_API_KEY="tvoj-skutocny-brevo-api-key"
pozn. - V apps/backend/src/lib/email.ts zmeň sender email na svoj overený email

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Google Maps API (pre výber lokácie aktivít)
# Pozri GOOGLE_MAPS_SETUP.md pre inštrukcie
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""

# OAuth (voliteľné)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## Pracovný postup pri vývoji

### 1. Práca na user stories

Pozri [USER_STORIES.md](USER_STORIES.md) pre aktuálny stav projektu a zoznam úloh.

### 2. Práca s databázou (Prisma)

```bash
# Zmena schémy (prisma/schema.prisma)
# → Potom spusti:
docker-compose exec backend npx prisma db push

# Otvor Prisma Studio (grafické rozhranie)
docker-compose exec backend npx prisma studio

# Reset databázy (POZOR: vymaže všetky dáta!)
docker-compose exec backend npx prisma db push --force-reset
```

### 3. Ladenie

```bash
# Záznamy backendu (API požiadavky, chyby)
docker-compose logs -f backend

# Záznamy frontendu (výstup zostavenia, chyby)
docker-compose logs -f frontend

# Záznamy databázy
docker-compose logs -f postgres
```

### 4. Pridávanie nových závislostí

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

## Architektúra Docker projektu

### Zjednotené Dockerfiles

Každý Dockerfile má **viacstupňové zostavenie (multi-stage build)** s dvoma režimami:

- **Vývojársky režim** (používa docker-compose.yml)
  - Automatické načítanie zmien cez pripojenie zväzkov
  - `npm run dev`
  - Vhodné pre ladenie

- **Produkčný režim** (pre nasadenie)
  - Optimalizované zostavenie
  - Viacstupňový obraz (menšia veľkosť)
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

## Pre vývojárov - Osvedčené postupy

### ✅ Commituj:
- Všetok kód v `apps/*/src/`
- `package.json`, `package-lock.json` (po pridaní závislostí)
- `prisma/schema.prisma` (po zmene schémy)
- `Dockerfile`, `docker-compose.yml`
- `.env.example` (template bez secrets)

### ❌ Necommituj:
- `node_modules/` (automaticky ignorované)
- `.next/` (výsledky zostavenia obrazov)
- `.env` (obsahuje tajné kľúče - NIKDY necommituj!)
- `.vscode/`, `.idea/` (nastavenia IDE)

### 🔄 Po každom git pull:

```bash
# Ak niekto zmenil Dockerfile alebo závislosti
docker-compose down
docker-compose up -d --build
```

### 🐛 Keď niečo nefunguje:

```bash
# 1. Skús reštart
docker-compose restart

# 2. Skús opätovné zostavenie
docker-compose up -d --build

# 3. Vyčisti všetko a začni odznova
docker-compose down -v
cp .env.example .env  # Obnov .env ak bol zmazaný
docker-compose up -d --build

# 4. Skontroluj záznamy
docker-compose logs -f
```

---

## AI funkcie (Gemini)

SportBuddy využíva **Google Gemini 2.0 Flash** pre inteligentné funkcie:

- **🔍 AI Vyhľadávanie** - Vyhľadávanie aktivít prirodzeným jazykom ("futbal zajtra v Košiciach")
- **💡 AI Odporúčania** - Personalizované návrhy aktivít na základe preferencií
- **📝 AI Vytvorenie aktivity** - Vytvorenie aktivity pomocou prirodzeného jazyka

### Konfigurácia Gemini

1. Získaj API kľúč na [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Pridaj kľúč do `.env`:
```properties
GEMINI_API_KEY="tvoj-api-kluc"
```

Free tier má limit 60 requests/minútu, čo je pre vývoj a bežné použitie dostačujúce.

---

## Ďalšie kroky

1. **Prečítaj si** [USER_STORIES.md](USER_STORIES.md) - zoznam všetkých používateľských príbehov a ich stav
2. **Vyber si úlohu**
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
