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
- ✅ Registračný formulár (/auth/signup)
- ✅ Prihlasovací formulár (/auth/signin)
- ✅ Validácia (email formát, heslo min 8 znakov s požiadavkami)
- ✅ Hash hesla (scrypt via Better Auth)
- ✅ Session management
- ✅ Responzívny dizajn formulárov
- ✅ Podmienené zobrazenie "Vytvoriť účet" button (skrytie pre prihlásených) - Jozef Kovalčín fix
- ✅ Voliteľné meno pri registrácii (môže sa vyplniť neskôr v profile settings) - Kamil Berecký

### Výsledné funkcie:
- ✅ Fungujúca registrácia s email/heslo
- ✅ Fungujúce prihlásenie
- ✅ Session persistence
- ✅ Redirect na /dashboard po prihlásení
- ✅ Meno je voliteľné pri registrácii, môže sa vyplniť v profile

---

## US-002: Používateľský profil & Dashboard

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vidieť a upraviť môj profil a dashboard s mojimi aktivitami
aby som mohol prezentovať svoje športové záujmy a mať prehľad o mojich udalostiach

**Vývojár:** Jozef Kovalčín

### Tasky:
#### Profil sekcia
- ✅ Profil stránka (/profile) 
- ✅ Zobrazenie: meno, email, mesto, bio, obľúbené športy
- ✅ Formulár na editáciu profilu (/profile/edit)
- ✅ Upload profilovej fotky
- ✅ API: GET /api/profile
- ✅ API: PUT /api/profile
- ✅ Validácia formulára
- ✅ Responzívny dizajn

#### Dashboard sekcia
- ✅ Dashboard stránka (/dashboard)
- ✅ API: GET /api/activities/my (filtrovanie podľa userId)
- ✅ Dve sekcie: "Moje aktivity" (vytvorené) a "Prihlásený na" (joined)
- ✅ Používanie Activity card komponentu
- ✅ Loading state
- ✅ Empty states
- ✅ Quick actions: "Vytvoriť aktivitu", "Hľadať aktivity"
- ✅ Štatistiky: počet aktivít, počet prihlásení
- ✅ Responzívny layout

### Výsledné funkcie:
- ✅ Zobrazenie profilu
- ✅ Editácia profilu
- ✅ Upload fotky
- ✅ Dashboard so zoznamom
- ✅ Filtrovanie funguje
- ✅ Štatistiky sa zobrazujú

---

## US-003: Vytvorenie aktivity

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vytvoriť novú športovú aktivitu
aby som našiel spoluhráčov

**Vývojár:** Kamil Berecký

### Tasky:
- ✅ Prisma schema: Activity model
- ✅ API: POST /api/activities
- ✅ Automatické pridanie tvorcu ako účastníka
- ✅ Validácia (dátum v budúcnosti, cena >= 0)
- ✅ Formulár na vytvorenie (/activities/create)
- ✅ Polia: názov, šport (dropdown), dátum, čas, miesto, max hráčov, úroveň, cena, popis
- ✅ React Hook Form + Zod validácia
- ✅ Loading state pri submit
- ✅ Redirect na detail po vytvorení
- ✅ Responzívny formulár
- ✅ Google Maps LocationPicker pre výber adresy - Jozef Kovalčín
- ✅ Automatické uloženie GPS súradníc a názvu miesta - Jozef Kovalčín
- ✅ Rozšírenie formulára o filter polia (pohlavie, min vek, max vek, cena) - Jozef Kovalčín
- ✅ Custom input tlačidlá s +/- tlačidlami - Jozef Kovalčín
- ✅ Pravidelne opakované aktivity (DAILY, WEEKLY, MONTHLY) - Jozef Kovalčín
- ✅ Výber dní v týždni pre týždenné opakovanie - Jozef Kovalčín
- ✅ Dátum ukončenia opakovania (voliteľný, default 2 mesiace) - Jozef Kovalčín
- ✅ Automatické generovanie budúcich inštancií pri vytvorení (max 20 inštancií alebo 2 mesiace) - Jozef Kovalčín
- ✅ Auto-join na všetky inštancie s možnosťou zadať počet hostí - Jozef Kovalčín
- ✅ Parent-child vzťah medzi opakovanými aktivitami - Jozef Kovalčín

### Výsledné funkcie:
- ✅ API endpoint funguje
- ✅ Funkčná validácia na BE
- ✅ Aktivita sa uloží do DB
- ✅ Frontend formulár implementovaný a funkčný
- ✅ Automatické načítanie venues
- ✅ Validácia na FE a BE
- ✅ Google Maps autocomplete pre adresu
- ✅ Uloženie lokácie, GPS súradníc a názvu miesta
- ✅ Všetky US-012 filter polia v create forme
- ✅ Pravidelné opakovanie aktivít (denné, týždenné, mesačné)
- ✅ UI pre výber dní v týždni
- ✅ Automatické vytváranie budúcich aktivít (max 20 inštancií alebo 2 mesiace)
- ✅ Auto-join pre organizátora na všetky inštancie s počtom hostí
- ✅ Parent-child vzťah s badge "Opakovaná" na kartách aktivít
- ✅ Sekcia "Nadchádzajúce termíny" na detail stránke (collapsible)
- ✅ Smart delete logic - pri zmazaní parent sa prvá child aktivita stane novým parentom

---

## US-004: Zoznam a detail aktivít

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vidieť zoznam aktivít a ich detail
aby som vedel, čo je k dispozícii

**Vývojár:** Kamil Berecký

### Tasky:
- ✅ API: GET /api/activities (pagination 20/page)
- ✅ API: GET /api/activities/[id]
- ✅ Filtrovanie podľa športu, mesta, statusu
- ✅ Stránka zoznamu (/activities)
- ✅ Card komponenta pre aktivitu
- ✅ Zobrazenie: názov, šport, dátum, čas, miesto, voľné miesta
- ✅ Loading skeleton
- ✅ Empty state ("Žiadne aktivity")
- ✅ Detail stránka (/activities/[id])
- ✅ Kompletné info + mapa (Google Maps embed)
- ✅ Zoznam účastníkov
- ✅ Progress bar obsadenosti
- ✅ Responzívny grid/detail
- ✅ Zobrazenie všetkých US-012 filter polí  - Jozef Kovalčín
- ✅ Google Maps iframe s názvom miesta - Jozef Kovalčín
- ✅ "Otvoriť v Mapách" tlačidlo s deep linking - Jozef Kovalčín

### Výsledné funkcie:
- ✅ API endpoints fungujú
- ✅ Zoznam aktivít (UI) s kartami
- ✅ Detail aktivity s kompletnou informáciou
- ✅ Mapa športoviska s názvom lokality
- ✅ Progress bar a zoznam účastníkov
- ✅ Loading states a empty states
- ✅ Zobrazenie pohlavia, vekového rozpätia a ceny
- ✅ Deep linking do Google Maps/Apple Maps

---

## US-005: Prihlasovanie na aktivity

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem sa prihlásiť na aktivitu
aby som rezervoval miesto

**Vývojár:** Kamil Berecký

### Tasky:
- ✅ Prisma schema: Booking model (many-to-many User-Activity)
- ✅ API: POST /api/activities/[id]/join
- ✅ Kontrola voľnej kapacity
- ✅ Kontrola duplicity (už prihlásený)
- ✅ Aktualizácia počtu hráčov
- ✅ Tlačidlo "Prihlásiť sa" na detaile
- ✅ Tlačidlo "Odhlásiť sa" ak som prihlásený
- ✅ API: DELETE /api/activities/[id]/join
- ✅ Optimistic updates (TanStack Query)
- ✅ Toast notifikácie
- ✅ Badge "Prihlásený" na karte aktivity

### Výsledné funkcie:
- ✅ Prihlásenie funguje (API + UI)
- ✅ Odhlásenie funguje (API + UI)
- ✅ Počet hráčov sa aktualizuje
- ✅ UI komponenty implementované
- ✅ Automatický refresh dát po akcii
- ✅ Vizuálna indikácia stavu (organizátor/účastník)
- ✅ Hromadné prihlásenie na všetky termíny opakovanej aktivity - Kamil Berecký
- ✅ Hromadné odhlásenie zo všetkých termínov opakovanej aktivity - Kamil Berecký
- ✅ API: POST /api/activities/[id]/join-recurring (hromadné prihlásenie) - Kamil Berecký
- ✅ API: POST /api/activities/[id]/leave-recurring (hromadné odhlásenie) - Kamil Berecký
- ✅ Podpora režimov: "all" (všetky termíny) a "specific-days" (konkrétne dni v týždni) - Kamil Berecký
- ✅ Možnosť pridať hostí pri hromadnom prihlásení - Kamil Berecký
- ✅ UI tlačidlá "Prihlásiť na všetky" a "Odhlásiť zo všetkých" v sekcii Nadchádzajúce termíny - Kamil Berecký
- ✅ Tlačidlá pre prihlásenie/odhlásenie na konkrétne dni (Pondelok, Utorok, atď.) - Kamil Berecký
- ✅ Konfirmačné dialógy pred hromadnými akciami - Kamil Berecký
- ✅ Hromadné akcie fungujú rovnako z parent aj child aktivít (automatické rozpoznanie parent ID) - Kamil Berecký

---

## US-006: Vyhľadávanie a filtrovanie aktivít

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vyhľadávať a filtrovať aktivity podľa rôznych kritérií
aby som rýchlo našiel aktivity, ktoré mi vyhovujú

**Vývojár:** Kamil Berecký

### Backend - Vyhľadávanie
- ✅ Prisma full-text search (názov, popis, miesto)
- ✅ Case-insensitive vyhľadávanie
- ✅ Search query parsing a validácia

### Backend - Filtrovanie
- ✅ API: GET /api/activities s rozšíreným filtrovaním
- ✅ Filtrovanie: sportType (druh športu)
- ✅ Filtrovanie: skillLevel (úroveň)
- ✅ Filtrovanie: gender (pohlavie)
- ✅ Filtrovanie: vekové rozpätie (minAge-maxAge)
- ✅ Filtrovanie: cena (od-do)
- ✅ Filtrovanie: dátum (od-do)
- ✅ Filtrovanie: status (OPEN, FULL, atď.)
- ✅ Správne kombinovanie filtrov (AND logika)

### Frontend - Search bar
- ✅ Search input na /activities stránke
- ✅ Real-time vyhľadávanie s debouncing (500ms)
- ✅ Loading spinner pri searchi
- ✅ Clear search button (X icon)
- ✅ "Žiadne výsledky" empty state s peknou ikonou

### Frontend - Filter panel
- ✅ Expandable/collapsible filter panel na /activities
- ✅ Dropdown/Select pre šport
- ✅ Dropdown/Select pre úroveň
- ✅ Dropdown/Select pre pohlavie
- ✅ Number inputs pre vek (od-do)
- ✅ Number inputs pre cenu (od-do)
- ✅ Date inputs pre dátumové rozpätie
- ✅ "Resetovať" tlačidlo
- ✅ Quick filter badges (zobrazenie aktívnych filtrov)
- ✅ Možnosť odstrániť jednotlivé filtre z badges
- ✅ Počet aktívnych filtrov v badge
- ✅ Počet výsledkov v real-time
- ✅ Collapse/Expand filter panel
- ✅ Responzívny dizajn (mobile/tablet/desktop)

### URL & State management
- ✅ Query params v URL (?search=futbal&sportType=FOOTBALL&skillLevel=BEGINNER)
- ✅ URL synchronizácia pri zmene filtrov
- ✅ Browser back/forward support
- ✅ Deep linking (možnosť zdieľať URL s filtrami)
- ✅ Automatické načítanie filtrov z URL pri otvorení stránky

### UX vylepšenia
- ✅ Skeleton loading pre výsledky (6 skeleton cards)
- ✅ Smooth transitions pri filtrovaní
- ✅ Real-time počet výsledkov
- ✅ Počet aktívnych filtrov badge
- ✅ Responzívny dizajn (mobile/tablet/desktop)
- ✅ Loading state s animáciou

### Výsledné funkcie:
- ✅ Backend API podporuje vyhľadávanie a filtrovanie
- ✅ Real-time search s debouncing
- ✅ Kompletný filter panel UI
- ✅ URL synchronizácia
- ✅ Mobile-responsive design
- ✅ Všetky filtre funkčné a testované
- ✅ Pekný UX s loading states a empty states

**Poznámka:** Spojené US-006 (Vyhľadávanie) a US-012 (Pokročilé filtrovanie) do jednej US.

---

## US-007: Základný UI/UX

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem pekné a funkčné rozhranie
aby som mal dobrý zážitok

**Vývojár:** Všetci spoločne

### Tasky:
- ✅ Responzívny dizajn (mobile/tablet/desktop)
- ✅ Header s navigáciou (logo, links, user menu)
- ✅ Footer (copyright, links) - acrylic design, zarovnané s navbar
- ✅ Dark mode toggle (Light/Dark/System)
- ✅ Fluent Design System (acrylic effects, shadows, borders)
- ✅ Loading states všade (skeleton, spinner)
- ✅ Notifikácie implementované
- ✅ Error states handling
- ✅ 404 stránka
- ✅ Konzistencia písma a farebných schém (CSS variables)
- ✅ Tailwind configurácia s custom variables
- ✅ Mobilné menu (hamburger)
- ✅ Animácie a transitions (hover-glow, reveal-effect)
- ✅ Gradient buttons a cards
- ✅ Custom SVG logo s animáciami
- ✅ Sticky navigation bar s acrylic efektom
- ✅ Lokalizácia do slovenčiny (SK)
- ✅ PWA support (manifest.json, service worker)
- ✅ Google Maps integration s custom styling
- ✅ Centralizovaný Google Maps loading (GoogleMapsContext)

### Výsledné funkcie:
- ✅ Responzívny dizajn pre všetky zariadenia
- ✅ Fluent Design System konzistentne aplikovaný
- ✅ Dark/Light mode s plynulými prechodmi
- ✅ Loading states a error handling všade
- ✅ Pekné animácie a visual effects
- ✅ Slovenská lokalizácia
- ✅ PWA ready

**Poznámka:** Dizajn v štýle Fluent (Windows 11), UI je plne funkčné.

---
## US-008: OAuth prihlásenie

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem sa prihlásiť pomocou Google, Facebook alebo iných platforiem
aby som nemusel vytvárať nové heslo a prihlásenie bolo rýchlejšie

**Vývojár:** Jozef Kovalčín

### Tasky:
- ✅ BetterAuth konfigurácia OAuth providers (Google, Facebook, Apple)
- ✅ Google OAuth setup (Client ID, Secret)
- ✅ Facebook OAuth setup (App ID, Secret)
- ✅ Apple OAuth setup (Client ID, Secret)
- ✅ Prisma schema: rozšírenie Account modelu (accessTokenExpiresAt, refreshTokenExpiresAt, scope)
- ✅ Account linking konfigurácia (trustedProviders)
- ✅ API: OAuth callback handling (redirect na frontend URL)
- ✅ Error page redirect (na frontend signin page)
- ✅ Tlačidlá "Prihlásiť cez Google/Facebook" na login/register stránke
- ✅ OAuth callback URLs (/api/auth/callback/google, /facebook)
- ✅ Mapovanie OAuth dát na User profil (email, meno, avatar)
- ✅ Session management pre OAuth users
- ✅ Responzívne OAuth tlačidlá
- ⏸️ Handling existujúceho účtu (merge alebo error) - funkčné s account linking

### Výsledné funkcie:
- ✅ Google login funguje
- ✅ Facebook login funguje (vyžaduje konfiguráciu Facebook Developer App)
- ✅ Apple login funguje (vyžaduje konfiguráciu Apple Developer Account)
- ✅ Automatické vytvorenie profilu
- ✅ Account linking medzi providers (trusted: Google, Facebook, Apple)


---

## US-009: Mapa s lokalitami aktivít

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vidieť polohu aktivít na Google Maps
aby som vedel, kde sa aktivita koná a ako ďaleko to mám

**Vývojár:** Jozef Kovalčín

### Tasky:
- ✅ Google Maps API setup (API key)
- ✅ Prisma schema: pridať lat/lng do Activity modelu
- ✅ Prisma schema: location, locationName
- ✅ LocationPicker komponenta s Google Maps Autocomplete
- ✅ Geocoding pri vytváraní aktivity (adresa → súradnice)
- ✅ API: GET /api/activities s lat/lng dátami
- ✅ React komponenta: LocationPicker s Google Maps autocomplete SDK
- ✅ Mapa na detail stránke (/activities/[id]) s iframe embed
- ✅ Mapa zobrazuje názov miesta namiesto GPS súradníc
- ✅ Tlačidlo "Otvoriť v Mapách" s deep linking
- ✅ Responzívna mapa (mobile/desktop)
- ✅ Custom styling pre autocomplete dropdown
- ✅ Stránka /venues s full-screen mapou (premenovaná na "Mapa aktivít")
- ✅ Google Maps integrácia (useLoadScript hook namiesto LoadScript)
- ✅ Markery pre všetky open aktivity na mape
- ✅ Custom marker ikony pre každý šport (emoji SVG)
- ✅ User location marker (modrý kruh SVG)
- ✅ Centrovanie mapy na user location (geolocation API)
- ✅ InfoWindow pri kliknutí na marker
- ✅ InfoWindow s inline styling (fix pre white background)
- ✅ InfoWindow zobrazuje: názov, šport, dátum, čas, účastníci, lokácia, cena
- ✅ "Zobraziť detail" button v InfoWindow s linkom na aktivitu
- ✅ Legenda s vysvetlením markerov (user location + športy)
- ⏸️ Prepínanie medzi zoznam view a mapa view na /activities

### Výsledné funkcie:
- ✅ Google Maps autocomplete pri vytváraní aktivity
- ✅ Automatické uloženie GPS súradníc
- ✅ Mapa na detaile aktivity s názvom miesta
- ✅ "Otvoriť v Mapách" button (funguje na PC aj mobile)
- ✅ Deep linking do Google Maps/Apple Maps
- ✅ Custom styled autocomplete dropdown
- ✅ Full-screen mapa na /venues s všetkými aktivitami
- ✅ Klikateľné markery s custom ikonami pre každý šport
- ✅ InfoWindow s kompletnou informáciou a správnym štýlovaním
- ✅ User location detection a zobrazenie
- ✅ Legenda pre orientáciu
- ⏸️ Toggle medzi listom a mapou

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

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem pridať aktivitu do môjho Google/Apple kalendára
aby som nezabudol na termín

**Vývojár:** - Ján Malinovský

### Tasky:
- ✅ Generovanie .ics súboru (iCalendar formát)
- ✅ API: GET /api/activities/[id]/calendar (vracia .ics)
- ✅ Google Calendar link generátor
- ✅ Apple Calendar kompatibilita
- ✅ Outlook Calendar link
- ✅ Tlačidlo "Pridať do kalendára" na detaile
- ✅ Dropdown menu s možnosťami (Google, Apple, Outlook, Download .ics)
- ✅ ICS súbor obsahuje: názov, popis, lokácia, začiatok, koniec, alarm (1h pred)
- ✅ Automatické nastavenie časového pásma
- ✅ Responzívne tlačidlo

### Výsledné funkcie:
- ✅ Google Calendar export
- ✅ Outlook Calendar export
- ✅ .ics download

---

## US-013: Verejný používateľský profil

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vidieť profily ostatných používateľov s ich predošlými aktivitami
aby som vedel, s kým budem hrať

**Vývojár:** Jozef Kovalčín

### Tasky:
#### Backend
- ✅ API: GET /api/users/[id] (verejné dáta)
- ✅ API: GET /api/users/[id]/activities (absolvované aktivity)
- ✅ Prisma query: počet aktivít, najhranejšie športy
- ⏸️ Privacy nastavenia (ktoré dáta sú verejné) - pre budúce rozšírenie

#### Frontend - Verejný profil
- ✅ Stránka /users/[id]
- ✅ Zobrazenie: meno, avatar, bio, mesto
- ✅ Štatistiky: počet aktivít, vytvorené, prihlásené, dokončené, nadchádzajúce
- ✅ Najhranejšie športy (top 3)
- ✅ Obľúbené športy z profilu
- ✅ Skill level badge
- ✅ Zoznam aktivít s tab navigáciou (nadchádzajúce/dokončené)
- ✅ "Člen od" dátum
- ⏸️ Badge systém (optional: "Častý hráč", "Organizátor" atď.) - pre budúce rozšírenie
- ⏸️ Hodnotenie/Recenzie od ostatných (optional) - pre budúce rozšírenie (US-015)
- ✅ Responzívny dizajn

#### Prepojenia
- ✅ Link na profil z activity detail (organizátor)
- ✅ Link na profil z activity detail (zoznam účastníkov)
- ✅ Avatar klikateľný → profil
- ⏸️ Link na profil z activity card (pri účastníkoch) - pre budúce rozšírenie

#### Privacy
- ⏸️ Nastavenie v /profile/privacy (čo je verejné) - pre budúce rozšírenie
- ⏸️ Možnosť skryť predošlé aktivity - pre budúce rozšírenie
- ⏸️ Možnosť skryť štatistiky - pre budúce rozšírenie

### Výsledné funkcie:
- ✅ Verejný profil stránka
- ✅ História aktivít s filtrom (nadchádzajúce/dokončené)
- ✅ Štatistiky používateľa (6 metrík)
- ✅ Najhranejšie športy
- ✅ Klikateľné linky na profily v activity detail
- ✅ Responzívny dizajn s Fluent UI
- ✅ Empty states pre aktivity

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

## US-015: Hodnotenie a recenzie

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem hodnotiť účastníkov po aktivite
aby ostatný vedeli, s kým hrajú

**Vývojár:** Kamil Berecký

### Tasky:
### Backend
- ✅ Prisma schema: Rating model (rating 1-5, comment, rater, rated user, activity)
- ✅ API: POST /api/activities/[id]/rate - hodnotenie účastníkov aktivity
- ✅ API: GET /api/activities/[id]/rate - získanie hodnotení pre aktivitu
- ✅ Validácia: len pre účastníkov aktivity
- ✅ Validácia: keď som prihlásený na aktivitu
- ✅ Validácia: jeden rating na používateľa na aktivitu
- ✅ Výpočet priemerného ratingu používateľa

### Frontend - Rating komponenty
- ✅ Rating modal po skončení aktivity
- ✅ Star rating komponenta (1-5 hviezd, interactive)
- ✅ Text area pre komentár (optional)
- ✅ Submit a Cancel tlačidlá
- ✅ Loading state pri odosielaní

### Frontend - Zobrazenie hodnotení
- ✅ Zobrazenie priemerného ratingu na profile (stars + číslo)
- ✅ Zoznam hodnotení na profile stránke
- ✅ Rating card komponenta (avatar, meno, rating, komentár, dátum, aktivita)
- ✅ Zobrazenie hodnotení na detail stránke aktivity
- ✅ "Žiadne hodnotenia" empty state
- ✅ Responzívny dizajn

### Výsledné funkcie:
- ✅ Rating systém funguje (1-5 hviezd)
- ✅ Hodnotenia na profile používateľa
- ✅ Priemerný rating sa zobrazuje na profile
- ✅ Hodnotenia viditeľné na detail stránke aktivity
- ✅ Možnosť hodnotiť len po skončení aktivity
- ✅ Jeden rating na používateľa na aktivitu

---

## US-016: Chat pre aktivitu

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem komunikovať s účastníkmi aktivity
aby sme mohli medzi sebou komunikovať

**Vývojár:** Jozef Kovalčín

### Tasky:
### Backend
- ✅ Prisma schema: Message model (activity_id, user_id, content, timestamp)
- ✅ API: GET /api/activities/[id]/messages (s pagination)
- ✅ API: POST /api/activities/[id]/messages
- ✅ API: DELETE /api/messages/[id] (delete vlastnej správy)
- ✅ Validácia: len pre prihlásených používateľov (správy môžu všetci vidieť, len prihlásení môžu písať)
- ✅ Validácia: max 500 znakov na správu
- ✅ Polling endpoint každých 5 sekúnd pre updates (simple real-time)
- ⏸️ Unread message tracking (Message.read field) - pre budúce rozšírenie
- ⏸️ API: PUT /api/messages/mark-read - pre budúce rozšírenie

### Frontend - Chat UI
- ✅ Chat UI komponenta (collapsible panel na detaile aktivity)
- ✅ Toggle button na otvorenie/zatvorenie chatu
- ✅ Message list (scrollable container)
- ✅ Message bubble komponenta (left/right podľa odosielateľa)
- ✅ Zobrazenie mena a fotky odosielateľa (alebo iniciál)
- ✅ Timestamp pre každú správu (relatívny čas: "pred 5 min")
- ✅ Message input field (textarea)
- ✅ Send button (disabled ak prázdne)
- ✅ Character counter (500/500)

### Real-time funkcie
- ✅ Auto-refresh každých 5 sekúnd (polling)
- ✅ Auto-scroll na novú správu (smooth scroll)
- ✅ Badge s počtom správ
- ⏸️ "Typing..." indikátor (optional) - pre budúce rozšírenie
- ⏸️ Message delivered/read status (optional) - pre budúce rozšírenie

### UX vylepšenia
- ⏸️ Emoji picker (optional - React Emoji Picker) - pre budúce rozšírenie
- ✅ Message delete option (len vlastné správy)
- ✅ "Load more" pagination support (50 messages per page)
- ✅ Empty state ("Zatiaľ žiadne správy")
- ✅ Loading skeleton pre načítavanie správ
- ✅ Error handling (error messages)
- ✅ Responzívny dizajn
- ✅ Login prompt pre neprihlásených používateľov

### Výsledné funkcie:
- ✅ Chat funguje
- ✅ Polling updates každých 5 sekúnd
- ✅ Neprihlásení používatelia môžu len prezerať, prihlásení môžu písať
- ✅ Message history s pagination
- ✅ Delete vlastných správ
- ✅ Character limit 500 znakov
- ✅ Auto-scroll a relatívny čas
- ✅ Collapsible panel s badge počtu správ


## US-018: AI Matchmaking pre hráčov

**Status:** 📋 PLANNED

Ako používateľ
chcem aby AI našlo kompatibilných spoluhráčov
aby som hral s ľuďmi na mojej úrovni

**Vývojár:** -

### Tasky:
### Backend - Database & Models
- ⏸️ Prisma schema: MatchScore model (user1_id, user2_id, score, factors)
- ⏸️ Prisma schema: rozšírenie User (playStyle, preferredTimes, skillLevels)
- ⏸️ Database indexes pre rýchle vyhľadávanie
- ⏸️ Cache layer pre match scores (Redis - optional)

### Compatibility Algorithm
- ⏸️ Skill level matching algorithm (weight: 25%)
- ⏸️ Play style preferences matching (competitive/casual) (weight: 20%)
- ⏸️ Age group similarity calculation (weight: 15%)
- ⏸️ Location proximity (Haversine distance) (weight: 20%)
- ⏸️ Schedule compatibility analysis (weight: 10%)
- ⏸️ Past activity ratings correlation (weight: 10%)
- ⏸️ Sport preferences overlap
- ⏸️ Final score calculation (weighted sum 0-100%)

### AI Integration
- ⏸️ OpenAI embeddings generation pre user profiles
- ⏸️ Vector similarity search (cosine similarity)
- ⏸️ Embedding storage (Pinecone/Supabase Vector)
- ⏸️ Batch embedding generation (pre existing users)
- ⏸️ Incremental embedding updates (pri zmene profilu)
- ⏸️ API: POST /api/ai/match-users

### Backend APIs
- ⏸️ API: GET /api/users/matches (top matches pre používateľa)
- ⏸️ API: GET /api/activities/[id]/suggested-users (pre danú aktivitu)
- ⏸️ API: POST /api/matches/[userId]/invite (pozvať matched usera)
- ⏸️ Match score caching (24h refresh)
- ⏸️ Pagination pre match results
- ⏸️ Filtering options (min score, max distance)

### Frontend - Match Discovery
- ⏸️ "Nájdi mi spoluhráča" feature page (/find-partners)
- ⏸️ Match score zobrazenie (1-100% progress bar + badge)
- ⏸️ Match card komponenta (avatar, meno, score, factors)
- ⏸️ Match explanation tooltip: "Podobná úroveň, blízka lokalita..."
- ⏸️ "Perfect match" badge (90%+ score) - special styling
- ⏸️ "Good match" badge (70-89%)
- ⏸️ Skill level indicators (beginner/intermediate/advanced)

### Frontend - Activity Integration
- ⏸️ Suggested users section na activity detail
- ⏸️ "Odporúčaní spoluhráči" widget (top 3)
- ⏸️ Invite matched user button
- ⏸️ Invite modal (personalizovaná správa)
- ⏸️ Toast notifikácia po odoslaní pozvánky

### Match Breakdown UI
- ⏸️ Expandable match details (klik na match card)
- ⏸️ Factor breakdown visualization:
 - ⏸️ Skill level match (progress bar)
 - ⏸️ Location proximity (distance in km)
 - ⏸️ Schedule compatibility (calendar icon)
 - ⏸️ Play style match (competitive/casual)
 - ⏸️ Common sports (badge list)
- ⏸️ "Prečo sme kompatibilní" text explanation (AI-generated)

### Email Digest
- ⏸️ Weekly "Best matches" email template
- ⏸️ Email service integration (SendGrid/Resend)
- ⏸️ Cron job: weekly match calculation a email send
- ⏸️ Top 5 matches v emaili
- ⏸️ CTA button: "Pozri všetky matched"
- ⏸️ Unsubscribe option

### User Preferences
- ⏸️ Match preferences page (/profile/match-preferences)
- ⏸️ Toggle: enable/disable matchmaking
- ⏸️ Max distance slider (5-50 km)
- ⏸️ Preferred age range
- ⏸️ Play style preference (competitive/casual/both)
- ⏸️ Notification frequency (instant/weekly/never)

### Analytics & Optimization
- ⏸️ Match success tracking (koľko invites accepted)
- ⏸️ Algorithm performance monitoring
- ⏸️ A/B testing framework (different weight combinations)
- ⏸️ User feedback collection ("Bol toto dobrý match?")

### Výsledné funkcie:
- ⏸️ Matchmaking algorithm
- ⏸️ Compatibility scores
- ⏸️ User suggestions
- ⏸️ Weekly digest

---

## US-019: Reset hesla cez email

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem si obnoviť heslo ak som ho zabudol
aby som sa mohol znova prihlásiť do aplikácie

**Vývojár:** Kamil Berecký

### Tasky:
- ✅ Prisma schema: PasswordReset model (token, userId, expiresAt, used)
- ✅ Email service setup (Brevo - 300 emailov/deň zadarmo)
- ✅ Verified sender email (kberecky@gmail.com) v Brevo dashboard
- ✅ API: POST /api/auth/forgot-password (generuje token a posiela email)
- ✅ API: POST /api/auth/reset-password (resetuje heslo s tokenom)
- ✅ Email template pre reset link (HTML s responsive dizajnom)
- ✅ Stránka /auth/forgot-password (formulár na zadanie emailu)
- ✅ Stránka /auth/reset-password?token=xxx (formulár na nové heslo)
- ✅ Validácia tokenu (expiracia 1 hodina, used flag)
- ✅ Bezpečné generovanie tokenu (crypto.randomBytes + SHA-256)
- ✅ Hash nového hesla (scrypt s Better Auth parametrami: N:16384, r:16, p:1, dkLen:64)
- ✅ Vymazanie tokenu po použití (used = true)
- ✅ Správne URL pre frontend (NEXT_PUBLIC_FRONTEND_URL)
- ✅ "Zabudli ste heslo?" link na signin stránke
- ✅ Success/Error feedback messages (slovenský jazyk)
- ✅ Rate limiting (max 3 requesty za hodinu na email)
- ✅ Responzívny dizajn
- ✅ Development mode (console log namiesto emailu keď BREVO_API_KEY="brevo_test_key")
- ✅ Production mode (Brevo API integration s messageId tracking)
- ✅ Všetky sessions sa vymažú po resete (force re-login)

### Výsledné funkcie:
- ✅ Odoslanie reset emailu funguje (Brevo API)
- ✅ Token validácia funguje (expiracia, duplicita, použitie)
- ✅ Reset hesla funguje s kompatibilným scrypt hashom
- ✅ Email template je pekný a funkčný s correct frontend URL
- ✅ Development mode bez Brevo API kľúča (console log)
- ✅ Production ready s Brevo integration
- ✅ Všetky sessions sa vymažú po resete (security)
- ✅ Prihlásenie funguje po resete hesla

**Technické detaily:**
- Email service: Brevo (@getbrevo/brevo SDK)
- Password hashing: Node.js crypto scrypt (Better Auth compatible)
- Token storage: PostgreSQL (PasswordReset table)
- Email delivery: 300/day limit (Brevo free tier)

---

## US-020: Stránka "Moje aktivity"

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem mať prehľad všetkých mojich aktivít (vytvorených aj prihlásených) na jednom mieste
aby som vedel, na čo som sa prihlásil a čo som vytvoril

**Vývojár:** Jozef Kovalčín

### Tasky:
- ✅ API: GET /api/activities/my (vracia created a joined aktivity)
- ✅ Backend logika: created = organizerId === userId
- ✅ Backend logika: joined = participation existuje pre userId (vrátane vlastných aktivít)
- ✅ Stránka /my-activities s tab navigáciou
- ✅ Tab "Vytvorené" (created activities)
- ✅ Tab "Prihlásené" (joined activities vrátane vlastných)
- ✅ Štatistiky: Total Created, Total Joined, Upcoming Created, Upcoming Joined
- ✅ Activity cards s badge "Organizátor" pre vytvorené
- ✅ Badge "Opakovaná" pre recurring aktivity
- ✅ Smart back navigation (sessionStorage tracking)
- ✅ Delete button pre organizátorov na detail stránke
- ✅ Redirect na source page po zmazaní (activities vs my-activities)
- ✅ Empty states pre obe záložky
- ✅ CTA buttons: "Vytvoriť aktivitu" / "Prehliadať aktivity"
- ✅ Responzívny dizajn

### Výsledné funkcie:
- ✅ Backend API vracia vytvorené aj prihlásené aktivity
- ✅ Tab navigácia medzi vytvorenými a prihlásenými
- ✅ Štatistiky zobrazujú správne počty
- ✅ Activity cards s visual badges (Organizátor, Opakovaná)
- ✅ Delete funkcia pre organizátorov s smart navigation
- ✅ Smart back button tracking (vracia na správnu stránku)
- ✅ Empty states s CTA akciami

---

## US-021: AI Asistent na tvorbu aktivít

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem pomocou prirodzeného jazyka (slovenčina) vytvoriť aktivitu
aby som nemusel manuálne vypĺňať všetky polia formulára

**Vývojár:** Jozef Kovalčín, Kamil Berecký

### Tasky:
- ✅ Integrácia Google Gemini API (gemini-2.5-flash-lite model)
- ✅ API: POST /api/activities/parse - spracovanie prirodzeného jazyka
- ✅ Rozpoznávanie športov a mapovanie na podporované typy
- ✅ Rozpoznávanie úrovní (začiatočník, stredne pokročilý, pokročilý, profesionál)
- ✅ Rozpoznávanie dátumov a časov vrátane relatívnych výrazov ("zajtra", "tento víkend", "o týždeň")
- ✅ Dynamické generovanie aktuálneho dátumu pre AI kontext
- ✅ Rozpoznávanie lokácií s Google Maps geocodingom
- ✅ Podpora opakovaných aktivít ("každý utorok a štvrtok")
- ✅ Rozpoznávanie frekvencie opakovania (DAILY, WEEKLY, MONTHLY)
- ✅ Rozpoznávanie dní v týždni pre týždenné opakovanie
- ✅ Formulár so vstupom pre AI a náhľadom výsledku
- ✅ Automatické vyplnenie formulára po spracovaní
- ✅ Možnosť upraviť AI výsledok pred odoslaním
- ✅ Fallback na manuálne vyplnenie

### Výsledné funkcie:
- ✅ AI rozpoznáva slovenské príkazy ako "basketbal pre pokročilých zajtra o 18:00 na ihrisku ZŠ Sekčov"
- ✅ AI rozpoznáva opakované aktivity "jóga každý utorok a štvrtok o 19:00"
- ✅ Automatické mapovanie na správne polia formulára
- ✅ Geocoding adresy na GPS súradnice
- ✅ Dynamický aktuálny dátum pre relatívne výrazy
- ✅ Náhľad parsovaných dát pred vyplnením
- ✅ Rate limiting pre Gemini API (15 RPM)

**Technické detaily:**
- Model: Google Gemini 2.5 Flash-Lite
- SDK: @google/generative-ai
- Response formát: JSON
- Geocoding: Google Maps Geocoder API
- Rate limit: 15 requests per minute

---

## US-022: AI Vyhľadávanie aktivít

**Status:** ✅ HOTOVÉ

Ako používateľ
chcem vyhľadávať aktivity pomocou prirodzeného jazyka (slovenčina)
aby som nemusel manuálne nastavovať všetky filtre

**Vývojár:** Jozef Kovalčín, Kamil Berecký

### Tasky:
- ✅ API: POST /api/ai/search - spracovanie vyhľadávacieho dotazu
- ✅ Rozpoznávanie športov a mapovanie na podporované typy
- ✅ Rozpoznávanie úrovní (začiatočník, stredne pokročilý, pokročilý, profesionál)
- ✅ Rozpoznávanie lokácií (mestá, adresy, konkrétne miesta)
- ✅ Rozpoznávanie dátumov vrátane relatívnych výrazov ("dnes", "zajtra", "tento víkend")
- ✅ Dynamické generovanie aktuálneho dátumu pre AI kontext
- ✅ Rozpoznávanie pohlavia (muži, ženy, zmiešané)
- ✅ Rozpoznávanie vekového rozpätia
- ✅ Rozpoznávanie ceny (zadarmo, cenové rozpätie)
- ✅ AISearchBar komponent s vizuálnym AI badge
- ✅ Náhľad rozpoznaných filtrov s slovenskými názvami
- ✅ Automatická aplikácia filtrov na zoznam aktivít
- ✅ Príklady vyhľadávaní pre používateľov

### Výsledné funkcie:
- ✅ AI rozpoznáva slovenské dotazy ako "futbal v Bratislave zajtra"
- ✅ AI rozpoznáva viacero športov "basketbal alebo volejbal dnes"
- ✅ AI rozpoznáva špeciálne požiadavky "joga zadarmo pre ženy"
- ✅ Automatické mapovanie na URL filtre
- ✅ Zobrazenie rozpoznaných filtrov v slovenčine (Futbal namiesto FOOTBALL)
- ✅ Dynamický aktuálny dátum pre relatívne výrazy
- ✅ Fallback na textové vyhľadávanie pri chybe
- ✅ Oprava filtra dátumu pre konkrétny deň (end of day)

**Technické detaily:**
- Model: Google Gemini 2.5 Flash-Lite
- SDK: @google/generative-ai
- Response formát: JSON
- Podpora filtrov: sportType, skillLevel, location, dateFrom, dateTo, gender, minAge, maxAge, priceFrom, priceTo

---

## Legenda

- ✅ Hotové (Completed)
- 🔄 WIP (Work In Progress - rozrobené)
- ⏸️ Nerealizované (Planned but not started)
- 📋 PLANNED (Celá user story je len naplánovaná)
