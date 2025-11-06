# Zmeny v systéme lokácií aktivít

## Prehľad zmien

Namiesto výberu športoviska zo zoznamu teraz používatelia zadávajú adresu pomocou Google Maps.

## Implementované zmeny

### 1. Databázová schéma (Prisma)
- Pridané polia do `Activity` modelu:
  - `location` (String) - plná adresa z Google Maps
  - `locationName` (String?) - voliteľný vlastný názov miesta
  - `latitude` (Float?) - GPS súradnica
  - `longitude` (Float?) - GPS súradnica
- `venueId` je teraz voliteľné (pre spätnú kompatibilitu)

### 2. Backend API
- Aktualizovaná validácia v `/api/activities`:
  - `location` je povinné pole
  - `locationName`, `latitude`, `longitude` sú voliteľné
  - `venueId` je teraz voliteľné

### 3. Frontend komponenty

#### LocationPicker komponent (`components/LocationPicker.tsx`)
- Google Maps Places Autocomplete pre vyhľadávanie adries
- Automatické získanie GPS súradníc
- Podpora pre Slovensko (country: "sk")
- Fallback na manuálny vstup ak Google Maps API nie je dostupné

#### Formulár na vytvorenie aktivity (`activities/create/page.tsx`)
- Odstránený výber športoviska
- Pridaný LocationPicker komponent
- Validácia adresy pred odoslaním

#### Detail aktivity (`activities/[id]/page.tsx`)
- Zobrazenie adresy namiesto športoviska
- Zobrazenie vlastného názvu miesta (ak je zadaný)
- Mapa s GPS súradnicami (ak sú dostupné)

#### Zoznam aktivít (`activities/page.tsx`)
- Zobrazenie adresy alebo názvu miesta v karte aktivity

## Nastavenie Google Maps API

Pre plnú funkcionalitu je potrebný Google Maps API kľúč:

1. Postupujte podľa návodu v súbore `GOOGLE_MAPS_SETUP.md`
2. Pridajte kľúč do `.env`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="váš-api-kľúč"
   ```
3. Reštartujte aplikáciu

### Bez Google Maps API
Aplikácia funguje aj bez API kľúča:
- Používateľ zadá adresu manuálne do textového poľa
- GPS súradnice nebudú dostupné
- Mapa sa nezobrazí v detaile aktivity

## Migrácia existujúcich dát

Existujúce aktivity v databáze majú stále nastavené `venueId`, ktoré zostáva zachované pre spätnú kompatibilitu. Pri zobrazení aktivít sa preferuje `location` pred `venue`.

Pre migráciu starých dát by bolo potrebné:
1. Načítať všetky aktivity s `venueId`
2. Skopírovať adresu z `venue` do `location`
3. Voliteľne použiť Geocoding API na získanie GPS súradníc

## Technické detaily

### TypeScript typy
- `google-maps.d.ts` - definície pre Google Maps API
- Aktualizované interface pre `Activity` vo všetkých komponentoch

### Závislosti
- Žiadne nové NPM balíčky
- Google Maps sa načítava priamo cez script tag
- Používa sa natívny Places Autocomplete API

## Testovanie

1. Vytvorte novú aktivitu
2. Začnite písať adresu (napr. "Bratislava")
3. Vyberte adresu zo zoznamu návrhov
4. Overte že sa zobrazuje náhľad vybranej lokácie
5. Odošlite formulár
6. V detaile aktivity skontrolujte zobrazenie adresy a mapy
