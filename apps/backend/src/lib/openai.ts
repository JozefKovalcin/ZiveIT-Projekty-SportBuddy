// Gemini AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash-lite";

console.log(
  "🤖 AI konfigurácia: Gemini",
  GEMINI_MODEL,
  GEMINI_API_KEY ? "(API key nastavený)" : "(API key chýba!)"
);

export const isAIEnabled = (): boolean => {
  return !!GEMINI_API_KEY;
};

// Helper function to call Gemini API
async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY nie je nastavený");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\nUser request: ${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Gemini API error:", error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Neplatná odpoveď od Gemini API");
  }

  return data.candidates[0].content.parts[0].text;
}

// Enums pre typy športov a úrovne
// Must match exactly with SportType enum in Prisma schema
const SPORT_TYPES = [
  "FOOTBALL",
  "BASKETBALL",
  "TENNIS",
  "VOLLEYBALL",
  "BADMINTON",
  "TABLE_TENNIS",
  "RUNNING",
  "CYCLING",
  "SWIMMING",
  "GYM",
  "OTHER",
];

const SKILL_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
  "PROFESSIONAL",
];

const GENDER_OPTIONS = ["MALE", "FEMALE", "MIXED"];

/**
 * Parsuje prirodzený jazyk do štruktúrovaných filtrov pre aktivity
 */
export async function parseNaturalLanguageQuery(query: string): Promise<{
  sportType?: string[];
  skillLevel?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  priceFrom?: number;
  priceTo?: number;
  searchQuery?: string;
}> {
  if (!GEMINI_API_KEY) {
    throw new Error("AI služba nie je dostupná. Skontrolujte GEMINI_API_KEY.");
  }

  // Dynamicky generujeme aktuálny dátum pre AI kontext
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  const dayOfWeek = today.getDay();
  const dayNames = [
    "nedeľa",
    "pondelok",
    "utorok",
    "streda",
    "štvrtok",
    "piatok",
    "sobota",
  ];
  const currentDayName = dayNames[dayOfWeek];

  // Vypočítame zajtra
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  // Vypočítame tento víkend (sobota a nedeľa)
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  const saturdayDate = saturday.toISOString().split("T")[0];
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  const sundayDate = sunday.toISOString().split("T")[0];

  const systemPrompt = `Si asistent pre športovú platformu SportBuddy. Tvoja úloha je parsovať používateľské dotazy v slovenskom jazyku a extrahovať relevantné filtre pre vyhľadávanie športových aktivít.

AKTUÁLNY DÁTUM A ČAS:
- Dnes je ${currentDayName}, ${currentDate}
- Zajtra je ${tomorrowDate}
- Tento víkend: sobota ${saturdayDate}, nedeľa ${sundayDate}

Dostupné typy športov: ${SPORT_TYPES.join(", ")}
Dostupné úrovne: ${SKILL_LEVELS.join(", ")}
Dostupné pohlavia: ${GENDER_OPTIONS.join(", ")}

Vráť JSON objekt s nasledujúcimi poľami (všetky sú optional):
- sportType: array stringov (napr. ["FOOTBALL", "BASKETBALL"])
- skillLevel: string (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT/PROFESSIONAL)
- location: string (mesto, adresa, alebo konkrétne miesto - zahrň všetky detaily lokácie)
- dateFrom: ISO date string (YYYY-MM-DD)
- dateTo: ISO date string (YYYY-MM-DD)
- gender: string (MALE/FEMALE/MIXED)
- minAge: number
- maxAge: number
- priceFrom: number
- priceTo: number
- searchQuery: string (všeobecné kľúčové slová)

DÔLEŽITÉ:
- Pre location zahrň CELÚ adresu alebo miesto ak je uvedené (nie len mesto).
- Príklady: "Májové námestie Prešov", "Základná škola Košice", "Park Bratislava".
- Športy MUSIA byť z tohto zoznamu: FOOTBALL, BASKETBALL, TENNIS, VOLLEYBALL, BADMINTON, TABLE_TENNIS, RUNNING, CYCLING, SWIMMING, GYM, OTHER
- GYM = posilňovňa, fitness, gym, kruhový tréning, funkčný tréning, crossfit
- Iné športy (jóga, lezenie, hiking, lyžovanie) = OTHER
- Pre "dnes" použi dateFrom a dateTo = ${currentDate}
- Pre "zajtra" použi dateFrom a dateTo = ${tomorrowDate}
- Pre "tento víkend" použi dateFrom = ${saturdayDate}, dateTo = ${sundayDate}

Príklady:
"futbal v Košiciach" -> {"sportType": ["FOOTBALL"], "location": "Košice"}
"futbal na májovom námestí v Prešove" -> {"sportType": ["FOOTBALL"], "location": "Májové námestie Prešov"}
"tenis na základnej škole v Košiciach" -> {"sportType": ["TENNIS"], "location": "Základná škola Košice"}
"posilňovňa alebo fitness" -> {"sportType": ["GYM"]}
"začiatočnícka joga zadarmo" -> {"sportType": ["OTHER"], "skillLevel": "BEGINNER", "priceFrom": 0, "priceTo": 0}
"basketbal alebo volejbal dnes" -> {"sportType": ["BASKETBALL", "VOLLEYBALL"], "dateFrom": "${currentDate}", "dateTo": "${currentDate}"}
"futbal zajtra" -> {"sportType": ["FOOTBALL"], "dateFrom": "${tomorrowDate}", "dateTo": "${tomorrowDate}"}
"tenis tento víkend" -> {"sportType": ["TENNIS"], "dateFrom": "${saturdayDate}", "dateTo": "${sundayDate}"}
"aktivity pre ženy od 20 do 30 rokov" -> {"gender": "FEMALE", "minAge": 20, "maxAge": 30}

Vráť VÝHRADNE JSON objekt, žiadny iný text.`;

  try {
    const responseText = await callGemini(systemPrompt, query);
    const result = JSON.parse(responseText);
    return result;
  } catch (error) {
    console.error("Chyba pri parsovaní natural language query:", error);
    // Fallback: vráť query ako searchQuery
    return { searchQuery: query };
  }
}

/**
 * Generuje odporúčania aktivít na základe používateľského profilu a histórie
 */
export async function generateActivityRecommendations(
  userId: string,
  userProfile: {
    favoriteSports?: string[];
    city?: string;
    skillLevel?: string;
    age?: number;
    pastActivities?: Array<{ sportType: string; skillLevel: string }>;
  }
): Promise<{
  filters: Record<string, any>;
  explanation: string;
}> {
  if (!isAIEnabled()) {
    throw new Error("AI služba nie je dostupná.");
  }

  const systemPrompt = `Si AI asistent pre odporúčanie športových aktivít. Na základe používateľského profilu vygeneruj inteligentné filtre pre vyhľadávanie aktivít.

Dostupné typy športov: ${SPORT_TYPES.join(", ")}
Dostupné úrovne: ${SKILL_LEVELS.join(
    ", "
  )} (BEGINNER=Začiatočník, INTERMEDIATE=Mierne pokročilý, ADVANCED=Pokročilý, EXPERT=Expert, PROFESSIONAL=Profesionál)

Vráť JSON objekt s:
- filters: objekt s filtrami (sportType, skillLevel, location, atď.)
- explanation: krátke vysvetlenie odporúčania v slovenčine (1-2 vety)

Príklad:
{
  "filters": {
    "sportType": ["FOOTBALL", "BASKETBALL"],
    "skillLevel": "INTERMEDIATE",
    "location": "Košice"
  },
  "explanation": "Na základe tvojich obľúbených športov a úrovne ti odporúčam futbal a basketbal v Košiciach."
}`;

  const userPrompt = `Profil používateľa:
- Obľúbené športy: ${userProfile.favoriteSports?.join(", ") || "žiadne"}
- Mesto: ${userProfile.city || "neurčené"}
- Úroveň: ${userProfile.skillLevel || "neurčená"}
- Vek: ${userProfile.age || "neurčený"}
- Posledné aktivity: ${
    userProfile.pastActivities
      ?.map((a) => `${a.sportType} (${a.skillLevel})`)
      .join(", ") || "žiadne"
  }

Vygeneruj inteligentné odporúčania.`;

  try {
    const responseText = await callGemini(systemPrompt, userPrompt);
    const result = JSON.parse(responseText);
    return result;
  } catch (error) {
    console.error("Chyba pri generovaní odporúčaní:", error);
    // Fallback: jednoduchý filter
    return {
      filters: {
        sportType: userProfile.favoriteSports || [],
        location: userProfile.city,
      },
      explanation: "Odporúčame aktivity na základe tvojich obľúbených športov.",
    };
  }
}

/**
 * Pomáha používateľovi vytvoriť aktivitu z prirodzeného jazyka
 */
export async function parseActivityCreationPrompt(prompt: string): Promise<{
  title?: string;
  description?: string;
  sportType?: string;
  skillLevel?: string;
  maxParticipants?: number;
  price?: number;
  location?: string;
  date?: string;
  time?: string;
  duration?: number;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  isRecurring?: boolean;
  recurrenceFrequency?: string;
  recurrenceDays?: number[];
  suggestions?: string[];
}> {
  if (!isAIEnabled()) {
    throw new Error("AI služba nie je dostupná.");
  }

  // Get current date for relative date calculations
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const dayNames = [
    "nedeľa",
    "pondelok",
    "utorok",
    "streda",
    "štvrtok",
    "piatok",
    "sobota",
  ];
  const todayName = dayNames[today.getDay()];

  const systemPrompt = `Si asistent pre vytváranie športových aktivít. Používateľ ti opíše, akú aktivitu chce vytvoriť v prirodzenom jazyku, a ty z toho vyextruješ štruktúrované dáta.

DNEŠNÝ DÁTUM: ${todayStr} (${todayName})
Použi tento dátum pre výpočet relatívnych dátumov ako "zajtra", "tento víkend", "budúci týždeň" atď.

Dostupné typy športov: ${SPORT_TYPES.join(", ")}
Dostupné úrovne: ${SKILL_LEVELS.join(
    ", "
  )} (BEGINNER=Začiatočník, INTERMEDIATE=Mierne pokročilý, ADVANCED=Pokročilý, EXPERT=Expert, PROFESSIONAL=Profesionál)
Dostupné pohlavia: ${GENDER_OPTIONS.join(", ")}

Vráť JSON objekt s nasledujúcimi poľami (všetky optional):
- title: string (názov aktivity)
- description: string (popis aktivity)
- sportType: string (FOOTBALL/BASKETBALL/TENNIS/VOLLEYBALL/BADMINTON/TABLE_TENNIS/RUNNING/CYCLING/SWIMMING/GYM/OTHER)
- skillLevel: string (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT/PROFESSIONAL)
- maxParticipants: number (koľko ľudí celkovo potrebuje, minimum 2 pre tímové športy)
- price: number (v eurách, predvolene 0 ak nie je uvedené)
- location: string (adresa alebo miesto)
- date: ISO date string (YYYY-MM-DD) - prvý dátum aktivity
- time: time string (HH:MM) - začiatok aktivity
- duration: number (trvanie v minútach, ak je uvedené "od X do Y" vypočítaj rozdiel)
- gender: string (MALE/FEMALE/MIXED)
- minAge: number
- maxAge: number
- isRecurring: boolean (true ak sa aktivita opakuje - každý deň, týždenne, mesačne)
- recurrenceFrequency: string (DAILY/WEEKLY/MONTHLY) - len ak isRecurring=true
- recurrenceDays: array čísel (0=nedeľa, 1=pondelok, 2=utorok, 3=streda, 4=štvrtok, 5=piatok, 6=sobota) - dni v týždni kedy sa opakuje, len ak recurrenceFrequency=WEEKLY
- suggestions: array stringov (návrhy na vylepšenie)

DÔLEŽITÉ PRAVIDLÁ:
- Skill level (úroveň zručnosti) NESÚVISÍ s cenou! BEGINNER aj PROFESSIONAL môžu byť zadarmo.
- Predvolená cena je 0€ (zadarmo), pokiaľ používateľ výslovne nespomenie cenu.
- maxParticipants by mal byť rozumný pre daný šport (futbal: 10-22, basketbal: 8-10, tenis: 2-4, beh: 5-20).
- NIKDY nedávaj maxParticipants = 1, lebo človek nemôže hrať sám so sebou!
- Ak používateľ nespomenie počet ľudí, použi primeraný počet pre daný šport.
- SportType MUSÍ byť z tohto zoznamu: FOOTBALL, BASKETBALL, TENNIS, VOLLEYBALL, BADMINTON, TABLE_TENNIS, RUNNING, CYCLING, SWIMMING, GYM, OTHER
- Štolový tenis = TABLE_TENNIS, behanie/beh = RUNNING, bicyklovanie/cyklistika = CYCLING, plávanie = SWIMMING
- GYM = posilňovňa, fitness, gym, kruhový tréning, funkčný tréning, crossfit, kondičný tréning, tréning v posilňovni
- Iné športy (jóga, lezenie, hiking, lyžovanie, squash atď.) = OTHER
- Čas "od X do Y" -> time: X (začiatok), duration: rozdiel v minútach. Príklad: "od 16:00 do 17:00" -> time: "16:00", duration: 60
- Pohlavie: muži/chlapi/chlapci = MALE, ženy/baby/dievčatá = FEMALE, zmiešané/mixed/všetci = MIXED (predvolené: MIXED)
- Vekové rozmedzie: "od X do Y rokov" -> minAge: X, maxAge: Y. "18+" -> minAge: 18. "deti" -> minAge: 6, maxAge: 17. "dospelí" -> minAge: 18, maxAge: 99.

Príklady:
"Chcem si zahrať futbal zajtra o 18:00 v Košiciach, potrebujem 10 ľudí" 
-> {"title": "Futbalový zápas", "sportType": "FOOTBALL", "date": "2025-11-29", "time": "18:00", "location": "Košice", "maxParticipants": 10, "price": 0, "gender": "MIXED"}

"Hľadám niekoho na tenis, som začiatočník, zadarmo"
-> {"title": "Tenis pre začiatočníkov", "sportType": "TENNIS", "skillLevel": "BEGINNER", "price": 0, "maxParticipants": 2, "gender": "MIXED"}

"Profesionálny basketbal zajtra"
-> {"title": "Basketbal pre profesionálov", "sportType": "BASKETBALL", "skillLevel": "PROFESSIONAL", "maxParticipants": 10, "price": 0, "gender": "MIXED", "date": "<ZAJTRA>"}

"Futbal pre ženy od 20 do 30 rokov v Prešove"
-> {"title": "Futbal pre ženy 20-30 rokov", "sportType": "FOOTBALL", "location": "Prešov", "gender": "FEMALE", "minAge": 20, "maxAge": 30, "maxParticipants": 14, "price": 0}

"Basketbal len pre chlapov 18+"
-> {"title": "Basketbal pre mužov 18+", "sportType": "BASKETBALL", "gender": "MALE", "minAge": 18, "maxAge": 99, "maxParticipants": 10, "price": 0}

"Detský tenis od 8 do 12 rokov"
-> {"title": "Detský tenis 8-12 rokov", "sportType": "TENNIS", "minAge": 8, "maxAge": 12, "maxParticipants": 4, "price": 0, "gender": "MIXED"}

"Kruhový tréning zajtra od 16:00 do 17:00 pre ženy od 15 rokov v 365 gyme v Prešove. Cena 5 eur."
-> {"title": "Kruhový tréning pre ženy 15+", "sportType": "GYM", "date": "<ZAJTRA>", "time": "16:00", "duration": 60, "location": "365 Gym, Prešov", "gender": "FEMALE", "minAge": 15, "maxAge": 99, "price": 5, "maxParticipants": 15}

"Chcem si ísť zabehať do parku zajtra ráno"
-> {"title": "Ranný beh v parku", "sportType": "RUNNING", "date": "<ZAJTRA>", "time": "08:00", "maxParticipants": 5, "price": 0, "gender": "MIXED"}

"Hľadám parťáka na stolný tenis"
-> {"title": "Stolný tenis", "sportType": "TABLE_TENNIS", "maxParticipants": 2, "price": 0, "gender": "MIXED"}

"Joga pre baby od 25 rokov"
-> {"title": "Joga pre ženy 25+", "sportType": "OTHER", "gender": "FEMALE", "minAge": 25, "maxAge": 99, "maxParticipants": 10, "price": 0}

"Joga každý utorok a štvrtok o 19:00"
-> {"title": "Joga - utorok a štvrtok", "sportType": "OTHER", "time": "19:00", "maxParticipants": 15, "price": 0, "gender": "MIXED", "isRecurring": true, "recurrenceFrequency": "WEEKLY", "recurrenceDays": [2, 4]}

"Beh každý deň o 7:00 ráno"
-> {"title": "Ranný beh", "sportType": "RUNNING", "time": "07:00", "maxParticipants": 10, "price": 0, "gender": "MIXED", "isRecurring": true, "recurrenceFrequency": "DAILY"}

"Futbal každú sobotu o 10:00"
-> {"title": "Sobotný futbal", "sportType": "FOOTBALL", "time": "10:00", "maxParticipants": 14, "price": 0, "gender": "MIXED", "isRecurring": true, "recurrenceFrequency": "WEEKLY", "recurrenceDays": [6]}

DÔLEŽITÉ: Nahraď <ZAJTRA> skutočným dátumom zajtra vo formáte YYYY-MM-DD podľa dnešného dátumu uvedeného vyššie!

Vráť VÝHRADNE JSON objekt, žiadny iný text.`;

  try {
    const responseText = await callGemini(systemPrompt, prompt);
    const result = JSON.parse(responseText);
    return result;
  } catch (error) {
    console.error("Chyba pri parsovaní activity creation prompt:", error);
    return {
      suggestions: [
        "Skús zadať viac detailov o aktivite, ktorú chceš vytvoriť.",
      ],
    };
  }
}
