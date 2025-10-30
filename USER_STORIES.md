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

**Vývojár:** Kamil Berecký

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

**Vývojár:** Kamil Berecký

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
## US-008: OAuth prihlásenie

**Status:** 📋 PLANNED

Ako používateľ
chcem sa prihlásiť pomocou Google, Facebook alebo iných platforiem
aby som nemusel vytvárať nové heslo a prihlásenie bolo rýchlejšie

**Vývojár:** -

### Tasky:
- ⏸️ BetterAuth konfigurácia OAuth providers (Google, Facebook)
- ⏸️ Google OAuth setup (Client ID, Secret)
- ⏸️ Facebook OAuth setup (App ID, Secret)
- ⏸️ Prisma schema: rozšírenie User modelu (providerId, provider)
- ⏸️ API: OAuth callback handling
- ⏸️ Tlačidlá "Prihlásiť cez Google/Facebook" na login/register stránke
- ⏸️ Mapovanie OAuth dát na User profil (email, meno, avatar)
- ⏸️ Handling existujúceho účtu (merge alebo error)
- ⏸️ Session management pre OAuth users
- ⏸️ Responzívne OAuth tlačidlá

### Výsledné funkcie:
- ⏸️ Google login funguje
- ⏸️ Facebook login funguje
- ⏸️ Automatické vytvorenie profilu
- ⏸️ Merge s existujúcim emailom (optional)

---

## US-009: Mapa s lokalitami aktivít

**Status:** 📋 PLANNED

Ako používateľ
chcem vidieť polohu aktivít na Google Maps
aby som vedel, kde sa aktivita koná a ako ďaleko to mám

**Vývojár:** -

### Tasky:
- ⏸️ Google Maps API setup (API key)
- ⏸️ Prisma schema: pridať lat/lng do Activity modelu
- ⏸️ Geocoding pri vytváraní aktivity (mesto/adresa → súradnice)
- ⏸️ API: GET /api/activities s lat/lng dátami
- ⏸️ React komponenta: MapView s Google Maps embed/SDK
- ⏸️ Markery pre jednotlivé aktivity na mape
- ⏸️ Info window pri kliknutí na marker (názov, šport, čas)
- ⏸️ Prepínanie medzi zoznam view a mapa view na /activities
- ⏸️ Mapa na detail stránke (/activities/[id])
- ⏸️ Directions link (navigácia do Google Maps)
- ⏸️ Responzívna mapa (mobile/desktop)
- ⏸️ Loading state pre mapu

### Výsledné funkcie:
- ⏸️ Mapa na zozname aktivít
- ⏸️ Mapa na detaile aktivity
- ⏸️ Klikateľné markery
- ⏸️ Navigácia do Google Maps

---

## US-010: Zdieľanie aktivít

**Status:** 📋 PLANNED

Ako používateľ
chcem zdieľať aktivitu na sociálnych sieťach
aby som mohol pozvať priateľov

**Vývojár:** -

### Tasky:
- ⏸️ Share API implementácia (Web Share API)
- ⏸️ Fallback pre desktopové prehliadače (Copy link + social share buttons)
- ⏸️ Share buttons: Facebook, Instagram, WhatsApp, Twitter/X, Email
- ⏸️ Generovanie share URL s UTM parametrami
- ⏸️ Open Graph meta tags pre aktivitu (og:title, og:image, og:description)
- ⏸️ Twitter Card meta tags
- ⏸️ Preview image generátor (optional - dynamický OG image)
- ⏸️ Share button na detail stránke
- ⏸️ Share button na activity card (optional)
- ⏸️ Toast notifikácia "Link skopírovaný"
- ⏸️ Analytics tracking pre shares (optional)

### Výsledné funkcie:
- ⏸️ Web Share API na mobile
- ⏸️ Social share tlačidlá
- ⏸️ Copy link funkcia
- ⏸️ Rich previews na sociálnych sieťach

---

## US-011: Pridanie do kalendára

**Status:** 📋 PLANNED

Ako používateľ
chcem pridať aktivitu do môjho Google/Apple kalendára
aby som nezabudol na termín

**Vývojár:** -

### Tasky:
- ⏸️ Generovanie .ics súboru (iCalendar formát)
- ⏸️ API: GET /api/activities/[id]/calendar (vracia .ics)
- ⏸️ Google Calendar link generátor
- ⏸️ Apple Calendar kompatibilita
- ⏸️ Outlook Calendar link
- ⏸️ Tlačidlo "Pridať do kalendára" na detaile
- ⏸️ Dropdown menu s možnosťami (Google, Apple, Outlook, Download .ics)
- ⏸️ ICS súbor obsahuje: názov, popis, lokácia, začiatok, koniec, alarm (1h pred)
- ⏸️ Automatické nastavenie časového pásma
- ⏸️ Responzívne tlačidlo

### Výsledné funkcie:
- ⏸️ Google Calendar export
- ⏸️ Apple Calendar export
- ⏸️ Outlook Calendar export
- ⏸️ .ics download

---

## US-012: Pokročilé filtrovanie a preferencie

**Status:** 📋 PLANNED

Ako používateľ
chcem filtrovať aktivity podľa skúseností, pohlavia, veku, ceny a ďalších kritérií
aby som našiel aktivity, ktoré mi vyhovujú

**Vývojár:** -

### Tasky:
#### Rozšírenie databázového modelu
- ⏸️ Prisma schema: rozšírenie Activity (skillLevel, gender, minAge, maxAge, price)
- ⏸️ Prisma schema: UserPreferences model (preferredSports, skillLevel, maxDistance, maxPrice)
- ⏸️ Migrácia databázy

#### Backend
- ⏸️ API: GET /api/activities s rozšíreným filtrovaním
- ⏸️ Filtrovanie: skillLevel (začiatočník, stredne pokročilý, pokročilý, expert)
- ⏸️ Filtrovanie: gender (muži, ženy, zmiešané)
- ⏸️ Filtrovanie: vekové rozpätie (minAge-maxAge)
- ⏸️ Filtrovanie: cena (od-do)
- ⏸️ API: GET/PUT /api/preferences (uloženie používateľských preferencií)

#### Frontend - Filter panel
- ⏸️ Bočný filter panel na /activities
- ⏸️ Dropdown/Select pre úroveň (skillLevel)
- ⏸️ Radio buttons pre pohlavie
- ⏸️ Slider/Input pre vek (range)
- ⏸️ Slider/Input pre cenu (range)
- ⏸️ Checkbox pre športy
- ⏸️ "Použiť filtre" a "Resetovať" tlačidlá
- ⏸️ Uložené preferencie v /profile/preferences
- ⏸️ Quick filter badges (zobrazenie aktívnych filtrov)
- ⏸️ Mobile-friendly filter (bottom sheet/modal)

#### Formulár na vytvorenie aktivity
- ⏸️ Pridať polia: skillLevel, gender, minAge, maxAge do create formu
- ⏸️ Validácia (minAge <= maxAge, price >= 0)

### Výsledné funkcie:
- ⏸️ Filtrovanie podľa všetkých kritérií
- ⏸️ Uloženie preferencií
- ⏸️ Rozšírený create form
- ⏸️ Responzívny filter UI

---

## US-013: Verejný používateľský profil

**Status:** 📋 PLANNED

Ako používateľ
chcem vidieť profily ostatných používateľov s ich predošlými aktivitami
aby som vedel, s kým budem hrať

**Vývojár:** -

### Tasky:
#### Backend
- ⏸️ API: GET /api/users/[id] (verejné dáta)
- ⏸️ API: GET /api/users/[id]/activities (absolvované aktivity)
- ⏸️ Prisma query: počet aktivít, hodnotenie (optional)
- ⏸️ Privacy nastavenia (ktoré dáta sú verejné)

#### Frontend - Verejný profil
- ⏸️ Stránka /users/[id]
- ⏸️ Zobrazenie: meno, avatar, bio, mesto
- ⏸️ Štatistiky: počet aktivít, obľúbené športy
- ⏸️ Zoznam predošlých aktivít (completed)
- ⏸️ Badge systém (optional: "Častý hráč", "Organizátor" atď.)
- ⏸️ Hodnotenie/Recenzie od ostatných (optional)
- ⏸️ Responzívny dizajn

#### Prepojenia
- ⏸️ Link na profil z activity card (pri účastníkoch)
- ⏸️ Link na profil z activity detail (zoznam účastníkov)
- ⏸️ Avatar klikateľný → profil

#### Privacy
- ⏸️ Nastavenie v /profile/privacy (čo je verejné)
- ⏸️ Možnosť skryť predošlé aktivity
- ⏸️ Možnosť skryť štatistiky

### Výsledné funkcie:
- ⏸️ Verejný profil stránka
- ⏸️ História aktivít
- ⏸️ Štatistiky používateľa
- ⏸️ Privacy nastavenia

---

## US-014: Notifikácie o nových aktivitách

**Status:** 📋 PLANNED

Ako používateľ
chcem dostávať notifikácie o nových aktivitách v mojom okolí podľa mojich preferencií
aby som nezmeškal zaujímavé aktivity

**Vývojár:** -

### Tasky:
#### Backend - Notifikačný systém
- ⏸️ Prisma schema: Notification model (type, userId, activityId, read, createdAt)
- ⏸️ API: GET /api/notifications (zoznam notifikácií)
- ⏸️ API: PUT /api/notifications/[id]/read (označiť ako prečítané)
- ⏸️ API: DELETE /api/notifications/[id]
- ⏸️ Background job: kontrola nových aktivít podľa preferencií (cron job)
- ⏸️ Matching engine: aktivita vs. user preferences (šport, location, price)
- ⏸️ Rate limiting (max X notifikácií denne)

#### Push notifikácie (optional)
- ⏸️ Web Push API setup
- ⏸️ Service Worker registrácia
- ⏸️ Push subscription management
- ⏸️ API: POST /api/notifications/subscribe
- ⏸️ Browser notification permission request

#### Email notifikácie
- ⏸️ Email service setup (SendGrid, Resend, alebo Nodemailer)
- ⏸️ Email template pre novú aktivitu
- ⏸️ Digest email (denný/týždenný súhrn)
- ⏸️ Unsubscribe link

#### Frontend - Notification center
- ⏸️ Notification bell icon v headeri
- ⏸️ Badge s počtom neprečítaných
- ⏸️ Dropdown/Panel s notifikáciami
- ⏸️ Notification item: avatar, text, čas, link na aktivitu
- ⏸️ "Označiť všetko ako prečítané"
- ⏸️ "Vymazať všetky"
- ⏸️ Link na /notifications (full page view)
- ⏸️ Real-time updates (WebSocket alebo polling)

#### Nastavenia notifikácií
- ⏸️ Stránka /profile/notifications
- ⏸️ Toggle: email notifikácie on/off
- ⏸️ Toggle: push notifikácie on/off
- ⏸️ Frekvencia: instant, denný digest, týždenný digest
- ⏸️ Filter: len obľúbené športy, len v okolí X km
- ⏸️ Quiet hours (nočný režim)

### Výsledné funkcie:
- ⏸️ In-app notifikácie
- ⏸️ Push notifikácie (optional)
- ⏸️ Email notifikácie
- ⏸️ Notifikačné centrum
- ⏸️ Konfigurovateľné nastavenia

---
## Legenda

- ✅ Hotové (Completed)
- 🔄 WIP (Work In Progress - rozrobené)
- ⏸️ Nerealizované (Planned but not started)
- 📋 PLANNED (Celá user story je len naplánovaná)

---
