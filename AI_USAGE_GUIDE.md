# 🤖 Ako používať AI funkcie v SportBuddy

## 📱 Pre používateľov aplikácie

### 🔍 1. AI Vyhľadávanie aktivít

Na hlavnej stránke s aktivitami (`/activities`) uvidíte **fialový AI search bar** hneď na vrchu.

#### Ako to funguje:
1. Napíšte do AI search baru, čo hľadáte v **prirodzenom jazyku**
2. Stlačte **"AI Vyhľadať"** alebo Enter
3. AI automaticky rozpozná vaše požiadavky a nastaví filtre

#### Príklady čo môžete napísať:

```
"futbal v Košiciach zajtra"
→ AI nastaví: Šport: Futbal, Mesto: Košice, Dátum: zajtra

"basketbal alebo volejbal pre začiatočníkov"
→ AI nastaví: Šport: Basketbal/Volejbal, Úroveň: Začiatočník

"tenis zadarmo tento víkend"
→ AI nastaví: Šport: Tenis, Cena: 0€, Dátum: víkend

"aktivity pre ženy od 20 do 30 rokov"
→ AI nastaví: Pohlavie: Ženy, Vek: 20-30

"joga v pondelok večer"
→ AI nastaví: Šport: Joga, Deň: Pondelok
```

#### Tipy:
- ✨ Môžete zadať viacero športov naraz: "futbal alebo basketbal"
- 📅 Používajte prirodzené výrazy: "zajtra", "tento víkend", "budúci týždeň"
- 💰 Stačí napísať "zadarmo" a AI nastaví cenu na 0€
- 🎯 Kombinujte podmienky: "bedminton pre pokročilých v Bratislave zadarmo"

---

### 🎨 2. AI Asistent pre vytvorenie aktivity

Na stránke **"Vytvoriť aktivitu"** (`/activities/create`) uvidíte tlačidlo:

**"🤖 Vytvoriť aktivitu s pomocou AI"**

#### Ako to funguje:
1. Kliknite na tlačidlo AI asistenta
2. Popíšte, akú aktivitu chcete vytvoriť v prirodzenom jazyku
3. Stlačte **"Generovať aktivitu"** alebo `Ctrl+Enter`
4. AI automaticky vyplní formulár za vás!

#### Príklady čo môžete napísať:

```
"Chcem si zahrať tenis zajtra o 18:00, som začiatočník, potrebujem 3 ľudí"
→ AI vyplní: Názov, Šport: Tenis, Dátum: zajtra, Čas: 18:00, 
              Úroveň: Začiatočník, Max účastníci: 3

"Futbal v pondelok večer v Košiciach pre 10 hráčov, cena 5€"
→ AI vyplní: Šport: Futbal, Deň: Pondelok, Mesto: Košice,
              Max účastníci: 10, Cena: 5€

"Beh v parku pre začiatočníkov, zadarmo, zajtra ráno"
→ AI vyplní: Šport: Beh, Úroveň: Začiatočník, Cena: 0€,
              Dátum: zajtra

"Joga každý utorok a štvrtok o 19:00"
→ AI vyplní: Šport: Joga, Pravidelná aktivita: Týždenne (Ut, Št),
              Čas: 19:00
```

#### Tipy:
- 💡 Čím viac detailov poskytnete, tým lepšie AI vyplní formulár
- 📝 Po generovaní si môžete ešte upraviť všetky polia
- ⚡ Použite `Ctrl+Enter` pre rýchle generovanie
- 🔄 Ak výsledok nesedí, upravte prompt a skúste znova

---

## 🎯 Výhody AI funkcií

### ⚡ Rýchlosť
- Namiesto klikania cez 10 filtrov, stačí jedna veta
- Vytvorenie aktivity za 10 sekúnd namiesto 2 minút

### 🧠 Inteligencia
- AI rozumie slovenčine a prirodzenému jazyku
- Rozpoznáva aj neformálne výrazy: "zajtra", "večer", "zadarmo"
- Dokáže spracovať viacero podmienok naraz

### 🔒 Súkromie
- **100% ZADARMO** - žiadne poplatky
- Beží na vašom serveri lokálne
- Dáta neopúšťajú vašu infraštruktúru

---

## 💡 Pokročilé funkcie

### Viacero športov
```
"futbal alebo basketbal alebo volejbal"
```

### Presné dátumy
```
"aktivity od 1.12 do 15.12"
"každý pondelok o 18:00"
```

### Cenové rozsahy
```
"aktivity do 10 eur"
"zadarmo alebo lacné aktivity"
```

### Kombinované podmienky
```
"pokročilý tenis v Bratislave zajtra večer zadarmo pre mužov"
→ AI rozpozná všetko: šport, úroveň, mesto, dátum, čas, cenu, pohlavie
```

---

## 🐛 Riešenie problémov

### AI nerozpoznalo moju požiadavku správne
- Skúste byť špecifickejší
- Použite jednoduchšie vety
- Rozdeľte komplexnú požiadavku na menšie časti

### AI search bar nie je viditeľný
- Skontrolujte, či je backend spustený (`http://localhost:3001`)
- Overte, že Ollama server beží

### Nič sa nestalo po kliknutí
- Otvorte konzolu prehliadača (F12)
- Skontrolujte Network tab pre chyby
- Overte pripojenie k backendu

---

## 📊 Štatistiky AI

- **Rýchlosť odozvy:** ~2-5 sekúnd
- **Presnosť:** ~90% pri slovenských dotazoch
- **Podporované jazyky:** Slovenčina, Čeština
- **Model:** Llama 3.2 (2GB, lokálny)

---

## 🚀 Ďalšie vylepšenia (plánované)

- [ ] Hlasové zadávanie cez mikrofón
- [ ] Chat interface pre konverzáciu s AI
- [ ] Personalizované odporúčania na dashboard
- [ ] AI návrhy podobných aktivít
- [ ] Automatické plánovanie aktivít

---

**Autor:** SportBuddy Team  
**Verzia:** 1.0  
**Dátum:** November 2025

---

## 📞 Podpora

Máte otázky alebo návrhy na zlepšenie?  
Otvorte issue na GitHube alebo kontaktujte vývojový tím.

**Enjoy your AI-powered sports activities! 🎾⚽🏀**
