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

**Poznámka:** Profil model existuje v databáze (User + Profile), ale žiadne UI stránky nie sú implementované. Dashboard stránka existuje s navigáciou a základnou štruktúrou (3 štatistické karty), ale neobsahuje žiadne reálne dáta ani zoznam aktivít.

---

## US-003: Vytvorenie aktivity

**Status:** 🔄 WIP (Work In Progress)

Ako používateľ
chcem vytvoriť novú športovú aktivitu
aby som našiel spoluhráčov

**Vývojár:** Kamil Berecký

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

**Vývojár:** Kamil Berecký

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

**Vývojár:** Kamil Berecký

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

## US-015: Hodnotenie a recenzie

**Status:** 📋 PLANNED

Ako používateľ
chcem hodnotiť účastníkov po aktivite
aby ostatný vedeli, s kým hrajú

**Vývojár:** -

### Tasky:
### Backend
- ⏸️ Prisma schema: Review model (rating 1-5, comment, reviewer, reviewed user)
- ⏸️ API: POST /api/users/[id]/reviews
- ⏸️ API: GET /api/users/[id]/reviews (zoznam recenzií)
- ⏸️ Validácia: len pre účastníkov aktivity
- ⏸️ Validácia: len po dátume aktivity
- ⏸️ Validácia: jeden review na používateľa na aktivitu
- ⏸️ Validácia: no spam, min 10 znakov pre comment
- ⏸️ Výpočet priemerného ratingu (agregácia)
- ⏸️ API: POST /api/reviews/[id]/report (report inappropriate review)

### Frontend - Review komponenty
- ⏸️ Review modal po skončení aktivity
- ⏸️ Star rating komponenta (1-5 hviezd, interactive)
- ⏸️ Text area pre komentár (optional, max 500 znakov)
- ⏸️ Character counter (500/500)
- ⏸️ Anonymous option checkbox (meno skryté)
- ⏸️ Submit a Cancel tlačidlá
- ⏸️ Loading state pri odosielaní

### Frontend - Zobrazenie recenzií
- ⏸️ Zobrazenie priemerného ratingu na profile (stars + číslo)
- ⏸️ Zoznam recenzií na profile stránke
- ⏸️ Review card komponenta (avatar, meno/anonymous, rating, komentár, dátum)
- ⏸️ Pagination pre recenzie (10 per page)
- ⏸️ Report inappropriate review button
- ⏸️ "Žiadne recenzie" empty state
- ⏸️ Responzívny dizajn

### Notifikácie
- ⏸️ Notifikácia pre používateľa pri novej recenzii
- ⏸️ Email notifikácia o novom hodnotení (optional)

### Výsledné funkcie:
- ⏸️ Rating systém funguje
- ⏸️ Reviews na profile
- ⏸️ Priemerný rating sa zobrazuje
- ⏸️ Report function

---

## US-016: Chat pre aktivitu

**Status:** 📋 PLANNED

Ako používateľ
chcem komunikovať s účastníkmi aktivity
aby sme mohli medzi sebou komunikovať

**Vývojár:** -

### Tasky:
### Backend
- ⏸️ Prisma schema: Message model (activity_id, user_id, content, timestamp)
- ⏸️ API: GET /api/activities/[id]/messages (s pagination)
- ⏸️ API: POST /api/activities/[id]/messages
- ⏸️ API: DELETE /api/messages/[id] (delete vlastnej správy)
- ⏸️ Validácia: len pre prihlásených účastníkov
- ⏸️ Validácia: max 500 znakov na správu
- ⏸️ Real-time setup (Pusher/Ably konfigurácia alebo polling endpoint)
- ⏸️ Unread message tracking (Message.read field)
- ⏸️ API: PUT /api/messages/mark-read

### Frontend - Chat UI
- ⏸️ Chat UI komponenta (sidebar/panel na detaile aktivity)
- ⏸️ Toggle button na otvorenie/zatvorenie chatu
- ⏸️ Message list (scrollable container)
- ⏸️ Message bubble komponenta (left/right podľa odosielateľa)
- ⏸️ Zobrazenie mena a fotky odosielateľa
- ⏸️ Timestamp pre každú správu (relatívny čas: "5 min ago")
- ⏸️ Message input field (textarea s auto-resize)
- ⏸️ Send button (disabled ak prázdne)
- ⏸️ Character counter (500/500)

### Real-time funkcie
- ⏸️ Real-time message receiving (Pusher/Ably integration)
- ⏸️ Auto-scroll na novú správu (smooth scroll)
- ⏸️ Unread message badge (počet neprečítaných)
- ⏸️ "Typing..." indikátor (optional)
- ⏸️ Message delivered/read status (optional)

### UX vylepšenia
- ⏸️ Emoji picker (optional - React Emoji Picker)
- ⏸️ Message delete option (len vlastné správy)
- ⏸️ "Load more" pre staršie správy (pagination)
- ⏸️ Empty state ("Začnite konverzáciu...")
- ⏸️ Loading skeleton pre načítavanie správ
- ⏸️ Error handling (offline, failed send)
- ⏸️ Responzívny dizajn (mobile drawer)

### Výsledné funkcie:
- ⏸️ Chat funguje
- ⏸️ Real-time updates
- ⏸️ Len pre účastníkov
- ⏸️ Message history

---

## US-017: AI Chatbot pre support

**Status:** 📋 PLANNED

Ako používateľ
chcem sa opýtať AI na otázky o platforme
aby som rýchlo našiel odpovede na moje otázky o platforme

**Vývojár:** -

### Tasky:
### Backend - AI Infrastructure
- ⏸️ API: POST /api/ai/support-chat
- ⏸️ OpenAI Assistants API integration
- ⏸️ API rate limiting (10 requests/day pre free users)
- ⏸️ Token usage tracking a cost monitoring
- ⏸️ Error handling a fallback responses
- ⏸️ API: GET /api/ai/chat-history (pre daného používateľa)
- ⏸️ API: DELETE /api/ai/chat-history (vymazanie histórie)

### RAG Setup (Retrieval Augmented Generation)
- ⏸️ Pinecone/Supabase Vector database setup
- ⏸️ Knowledge base creation (FAQ dokumenty)
- ⏸️ Platform guide embeddings (ako používať features)
- ⏸️ FAQ dokumenty embeddings
- ⏸️ Vector search implementation
- ⏸️ Context injection do AI promptu
- ⏸️ Relevance scoring a filtering

### Context-Aware Features
- ⏸️ Current page detection (URL tracking)
- ⏸️ User profile info injection (ak prihlásený)
- ⏸️ Recent user actions tracking (last 5 actions)
- ⏸️ Dynamic prompt construction based on context
- ⏸️ Session-based conversation memory

### Frontend - Chat Widget
- ⏸️ Floating chat button (bottom right, sticky)
- ⏸️ Badge notification (nová odpoveď)
- ⏸️ Chat window komponenta (minimize/maximize/close)
- ⏸️ Chat header s titulom a actions
- ⏸️ Message list (user + AI bubbles)
- ⏸️ Message input field
- ⏸️ Send button
- ⏸️ Loading indicator (typing dots)
- ⏸️ Scroll to bottom button

### Quick Actions
- ⏸️ Quick action buttons: "Ako vytvoriť aktivitu?"
- ⏸️ Quick action buttons: "Ako sa prihlásiť?"
- ⏸️ Quick action buttons: "Ako nájsť aktivity?"
- ⏸️ Quick action buttons: "Ako upraviť profil?"
- ⏸️ Dynamic suggestions based on page

### Advanced Features
- ⏸️ Chat history persistence (conversation_id v localStorage)
- ⏸️ "Nová konverzácia" button (reset context)
- ⏸️ Escalation to human support button
- ⏸️ Human support form (meno, email, správa)
- ⏸️ Multilingual support (SK/EN auto-detection)
- ⏸️ Copy response button
- ⏸️ Thumbs up/down feedback
- ⏸️ "Bolo to užitočné?" feedback

### Analytics
- ⏸️ Common questions tracking (analytics dashboard)
- ⏸️ User satisfaction metrics (feedback aggregation)
- ⏸️ Response time monitoring
- ⏸️ Escalation rate tracking
- ⏸️ Most helpful answers identification

### UX Polish
- ⏸️ Smooth animations (open/close, messages)
- ⏸️ Typing indicator when AI is responding
- ⏸️ Error states ("Niečo sa pokazilo, skúste znova")
- ⏸️ Offline detection a warning
- ⏸️ Mobile responsive design
- ⏸️ Keyboard shortcuts (ESC to close)
- ⏸️ Welcome message on first open

### Výsledné funkcie:
- ⏸️ AI chatbot funguje
- ⏸️ RAG s knowledge base
- ⏸️ Context-aware answers
- ⏸️ Chat history


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

## Legenda

- ✅ Hotové (Completed)
- 🔄 WIP (Work In Progress - rozrobené)
- ⏸️ Nerealizované (Planned but not started)
- 📋 PLANNED (Celá user story je len naplánovaná)

---
