# Google Maps API - Nastavenie

Aplikácia používa Google Maps API pre výber lokácie aktivít. Tento návod vám ukáže, ako získať API kľúč.

## Postup získania API kľúča

### 1. Vytvorenie projektu v Google Cloud Console

1. Prejdite na [Google Cloud Console](https://console.cloud.google.com/)
2. Prihláste sa pomocou Google účtu
3. Kliknite na dropdown v hornej časti stránky a vyberte "New Project"
4. Zadajte názov projektu (napr. "SportBuddy") a kliknite "Create"

### 2. Aktivácia potrebných API

1. V Google Cloud Console prejdite na **APIs & Services > Library**
2. Vyhľadajte a aktivujte nasledujúce API:
   - **Maps JavaScript API** - pre zobrazenie máp
   - **Maps Embed API** - pre vložené mapy (iframe)
   - **Places API** - pre autocomplete adries (legacy)
   - **Places API (New)** - pre zobrazenie miesta na mape
   - **Geocoding API** - pre získanie GPS súradníc

Pre každé API:
- Kliknite na názov API
- Kliknite na tlačidlo "Enable"

### 3. Vytvorenie API kľúča

1. Prejdite na **APIs & Services > Credentials**
2. Kliknite na **+ CREATE CREDENTIALS** v hornej časti
3. Vyberte **API key**
4. API kľúč bude vytvorený - **skopírujte ho**

### 4. Obmedzenie API kľúča (Dôležité pre bezpečnosť!)

Po vytvorení kľúča je dôležité ho obmedziť:

1. V zozname API kľúčov kliknite na ikonu tužky (Edit) vedľa vášho kľúča
2. V sekcii **Application restrictions**:
   - **PRE DEVELOPMENT:** Vyberte "None" (žiadne obmedzenia)
   - **PRE PRODUCTION:** Vyberte "HTTP referrers" a pridajte vašu doménu
   - Poznámka: Maps Embed API má problémy s HTTP referrers v development móde
3. V sekcii **API restrictions**:
   - Vyberte "Restrict key"
   - Zaškrtnite:
     - Maps JavaScript API
     - Maps Embed API
     - Places API
     - Places API (New)
     - Geocoding API
4. Kliknite na **Save**

**DÔLEŽITÉ:** 
- Po uložení zmien môže trvať až 5 minút, kým sa zmeny prejavia
- Pre development odporúčame nastaviť "Application restrictions" na "None"
- Pre production použite HTTP referrers s vašou doménou

### 5. Pridanie API kľúča do projektu

1. V koreňovom priečinku projektu vytvorte súbor `.env` (ak neexistuje)
2. Skopírujte obsah zo súboru `.env.example`
3. Do premennej `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` vložte váš API kľúč:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="váš-api-kľúč-tu"
```

### 6. Reštart aplikácie

Po pridaní API kľúča reštartujte Docker kontajnery:

```bash
docker-compose restart frontend
```

## Ceny a limity

Google Maps API ponúka **$200 mesačného kreditu zadarmo**, což pokrýva:
- Cca 28,000 načítaní máp mesačne
- Cca 100,000 autocomplete requestov mesačne

Pre väčšinu aplikácií v development a malých produkčných použití je to dostačujúce.

## Riešenie problémov

### "Google Maps Platform rejected your request" alebo HTTP 403
**Najčastejší problém s Maps Embed API v development móde!**

**Rýchle riešenie:**
1. Prejdite na **Google Cloud Console > APIs & Services > Credentials**
2. Kliknite na Edit vedľa vášho API kľúča
3. V sekcii **Application restrictions** zvoľte **"None"**
4. Kliknite **Save**
5. Počkajte 2-5 minút
6. Vyčistite cache prehliadača (Ctrl+Shift+Delete)
7. Obnovte stránku (F5)

**Poznámka:** Pre production nasadenie použite HTTP referrers s vašou doménou (napr. `https://vasadomena.sk/*`)

### "Google Maps API kľúč nie je nastavený"
- Skontrolujte, že ste vytvorili `.env` súbor
- Overte, že premenná je správne pomenovaná: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Reštartujte Docker kontajner

### "This page can't load Google Maps correctly"
- Skontrolujte, že ste aktivovali všetky potrebné API (Maps JavaScript, Maps Embed, Places, Places (New), Geocoding)
- Skúste odstrániť Application restrictions (nastaviť na "None")

### Autocomplete nefunguje
- Uistite sa, že je aktivované **Places API**
- Skontrolujte obmedzenia API kľúča

## Alternatívne riešenia (bez Google Maps)

Ak nechcete používať Google Maps API, aplikácia funguje aj s manuálnym zadávaním adresy:
- Používateľ môže zadať adresu textom
- GPS súradnice nebudú dostupné, ale aplikácia bude fungovať

Pre vypnutie Google Maps integrácie jednoducho nenastávajte `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` premennú.
