# SportBuddy - User Stories

---

## US-001: Registrácia a prihlásenie

**Status:** ✅ HOTOVÉ

Ako nový používateľ
chcem sa zaregistrovať a prihlásiť
aby som mohol používať aplikáciu

**Vývojár:** Kamil Berecký

### Tasky:
- ✅ Setup Next.js projekt + Tailwind + BetterAuth
- ✅ PostgreSQL databáza
- ✅ Prisma schema: User model
- ✅ BetterAuth konfigurácia (credentials provider)
- ✅ Registračný formulár (/register)
- ✅ Prihlasovací formulár (/login)
- ✅ Validácia (email formát, heslo min 8 znakov)
- ✅ Hash hesla (bcrypt)
- ✅ Session management (localStorage)
- ✅ Responzívny dizajn formulárov

### Výsledné funkcie:
- ✅ Fungujúca registrácia
- ✅ Fungujúce prihlásenie
- ✅ Session persistence
- ✅ Redirect na /dashboard po prihlásení

---

## US-002: Používateľský profil & Dashboard

**Status:** 📋 PLANNED

Ako používateľ
chcem vidieť a upraviť môj profil a dashboard s mojimi aktivitami
aby som mohol prezentovať svoje športové záujmy a mať prehľad o mojich udalostiach

**Vývojár:** -

### Tasky:
#### Profil sekcia
- ⏸️ Profil stránka (/profile) - **NEIMPLEMENTOVANÉ**
- ⏸️ Zobrazenie: meno, email, mesto, bio, obľúbené športy
- ⏸️ Formulár na editáciu profilu (/profile/edit)
- ⏸️ Upload profilovej fotky
- ⏸️ API: GET /api/profile
- ⏸️ API: PUT /api/profile
- ⏸️ Validácia formulára
- ⏸️ Responzívny dizajn

#### Dashboard sekcia
- ⏸️ Dashboard stránka (/dashboard) - **EXISTUJE ale je prázdny**
- ⏸️ API: GET /api/activities/my (filtrovanie podľa userId)
- ⏸️ Dve sekcie: "Moje aktivity" (vytvorené) a "Prihlásený na" (joined)
- ⏸️ Používanie Activity card komponentu
- ⏸️ Loading state
- ⏸️ Empty states
- ⏸️ Quick actions: "Vytvoriť aktivitu", "Hľadať aktivity"
- ⏸️ Štatistiky: počet aktivít, počet prihlásení - **Základné karty existujú**
- ⏸️ Responzívny layout

### Výsledné funkcie:
- ⏸️ Zobrazenie profilu
- ⏸️ Editácia profilu
- ⏸️ Upload fotky
- ⏸️ Dashboard so zoznamom - **Dashboard existuje, ale nezobrazuje zoznam aktivít**
- ⏸️ Filtrovanie funguje
- ⏸️ Štatistiky sa zobrazujú - **Iba placeholder štatistiky (0, 0, -)**

**Poznámka:** Profil model existuje v databáze (User + Profile), ale žiadne UI stránky nie sú implementované. Dashboard stránka existuje s navigáciou a základnou štruktúrou (3 štatistické karty), ale neobsahuje žiadne reálne dáta ani zoznam aktivít.

---

## US-003: Vytvorenie aktivity

**Status:** 🔄 WIP (Work In Progress)

Ako používateľ
chcem vytvoriť novú športovú aktivitu
aby som našiel spoluhráčov

**Vývojár:** -

### Tasky:
- ✅ Prisma schema: Activity model
- ✅ API: POST /api/activities
- ✅ Automatické pridanie tvorcu ako účastníka
- ✅ Validácia (dátum v budúcnosti, cena >= 0)
- ⏸️ Formulár na vytvorenie (/activities/create)
- ⏸️ Polia: názov, šport (dropdown), dátum, čas, miesto, max hráčov, úroveň, cena, popis
- ⏸️ React Hook Form + Zod validácia
- ⏸️ Loading state pri submit
- ⏸️ Redirect na detail po vytvorení
- ⏸️ Responzívny formulár

### Výsledné funkcie:
- ✅ API endpoint funguje
- ✅ Funkčná validácia na BE
- ✅ Aktivita sa uloží do DB
- ⏸️ Frontend formulár chýba

**Poznámka:** API je hotové, ale chýba frontend formulár na vytvorenie aktivity.

---

## US-004: Zoznam a detail aktivít

**Status:** 🔄 WIP (Work In Progress)

Ako používateľ
chcem vidieť zoznam aktivít a ich detail
aby som vedel, čo je k dispozícii

**Vývojár:** -

### Tasky:
- ✅ API: GET /api/activities (pagination 20/page)
- ✅ API: GET /api/activities/[id]
- ✅ Filtrovanie podľa športu, mesta, statusu
- ⏸️ Stránka zoznamu (/activities)
- ⏸️ Card komponenta pre aktivitu
- ⏸️ Zobrazenie: názov, šport, dátum, čas, miesto, voľné miesta
- ⏸️ Loading skeleton
- ⏸️ Empty state ("Žiadne aktivity")
- ⏸️ Detail stránka (/activities/[id])
- ⏸️ Kompletné info + mapa (Google Maps embed)
- ⏸️ Zoznam účastníkov
- ⏸️ Progress bar obsadenosti
- ⏸️ Responzívny grid/detail

### Výsledné funkcie:
- ✅ API endpoints fungujú
- ⏸️ Zoznam aktivít (UI)
- ⏸️ Detail aktivity (UI)
- ⏸️ Pagination funguje

**Poznámka:** Backend API je kompletný s filtrovaním, ale chýba celý frontend UI.

---

## US-005: Prihlasovanie na aktivity

**Status:** 🔄 WIP (Work In Progress)

Ako používateľ
chcem sa prihlásiť na aktivitu
aby som rezervoval miesto

**Vývojár:** -

### Tasky:
- ✅ Prisma schema: Booking model (many-to-many User-Activity)
- ✅ API: POST /api/activities/[id]/join
- ✅ Kontrola voľnej kapacity
- ✅ Kontrola duplicity (už prihlásený)
- ✅ Aktualizácia počtu hráčov
- ⏸️ Tlačidlo "Prihlásiť sa" na detaile
- ⏸️ Tlačidlo "Odhlásiť sa" ak som prihlásený
- ⏸️ API: DELETE /api/activities/[id]/leave
- ⏸️ Optimistic updates (TanStack Query)
- ⏸️ Toast notifikácie
- ⏸️ Badge "Prihlásený" na karte aktivity

### Výsledné funkcie:
- ✅ Prihlásenie funguje (API)
- ⏸️ Odhlásenie funguje
- ✅ Počet hráčov sa aktualizuje
- ⏸️ UI komponenty chýbajú

**Poznámka:** Join API je hotové, ale chýba leave endpoint a všetky UI elementy.

---

## US-006: Vyhľadávanie aktivít

**Status:** 🔄 WIP (Work In Progress)

Ako používateľ
chcem vyhľadávať aktivity
aby som rýchlo našiel, čo ma zaujíma

**Vývojár:** -

### Tasky:
- ✅ API: GET /api/activities?search=... (full-text cez názov, popis)
- ✅ Prisma search
- ⏸️ Search bar
- ⏸️ Search input na /activities
- ⏸️ Loading spinner pri searchi
- ⏸️ Highlighting výsledkov (optional)
- ⏸️ Clear search button
- ⏸️ "Žiadne výsledky" state
- ⏸️ Query params v URL (?search=futbal)

### Výsledné funkcie:
- ✅ Vyhľadávanie funguje (API)
- ⏸️ Real-time výsledky (UI)
- ⏸️ URL synchronizácia

**Poznámka:** API podporuje search, ale UI komponenty nie sú implementované.

---

## US-007: Základný UI/UX

**Status:** 🔄 WIP (Work In Progress)

Ako používateľ
chcem pekné a funkčné rozhranie
aby som mal dobrý zážitok

**Vývojár:** Všetci spoločne

### Tasky:
- ✅ Responzívny dizajn (mobile/tablet/desktop)
- ✅ Header s navigáciou (logo, links, user menu)
- ✅ Footer (copyright, links)
- ✅ Dark mode toggle
- ⏸️ Loading states všade (skeleton, spinner)
- ⏸️ Notifikácie (react-hot-toast)
- ⏸️ Error states a error boundaries
- ⏸️ 404 stránka
- ✅ Konzistencia písma a farebných schém
- ✅ Tailwind configurácia
- ✅ Mobilné menu (hamburger)

### Výsledné funkcie:
- ✅ Responzívny dizajn
- ✅ Konzistentný UI
- ⏸️ Loading/Error states

**Poznámka:** Základný design a theme switching je hotový, ale chýbajú loading states, error handling a notifikácie.

---

## Legenda

- ✅ Hotové (Completed)
- 🔄 WIP (Work In Progress - rozrobené)
- ⏸️ Nerealizované (Planned but not started)
- 📋 PLANNED (Celá user story je len naplánovaná)

---
