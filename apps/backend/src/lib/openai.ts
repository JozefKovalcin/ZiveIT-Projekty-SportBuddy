import OpenAI from 'openai';

// Ollama beží lokálne a používa OpenAI-kompatibilné API
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

console.log('🤖 AI konfigurácia: Ollama na', OLLAMA_BASE_URL, 'používa model', OLLAMA_MODEL);

// Vytvor OpenAI klienta, ktorý sa pripojí na Ollama
export const openai = new OpenAI({
  baseURL: OLLAMA_BASE_URL,
  apiKey: 'ollama', // Ollama nevyžaduje API key, ale OpenAI klient ho potrebuje
});

export const isAIEnabled = (): boolean => {
  return true; // Ollama je vždy dostupné, ak beží lokálne
};

// Enums pre typy športov a úrovne
// Must match exactly with SportType enum in Prisma schema
const SPORT_TYPES = [
  'FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL', 'BADMINTON',
  'TABLE_TENNIS', 'RUNNING', 'CYCLING', 'SWIMMING', 'GYM', 'OTHER'
];

const SKILL_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'PROFESSIONAL'];

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'MIXED'];

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
  if (!openai) {
    throw new Error('AI služba nie je dostupná. Skontrolujte OPENAI_API_KEY.');
  }

  const systemPrompt = `Si asistent pre športovú platformu SportBuddy. Tvoja úloha je parsovať používateľské dotazy v slovenskom jazyku a extrahovať relevantné filtre pre vyhľadávanie športových aktivít.

Dostupné typy športov: ${SPORT_TYPES.join(', ')}
Dostupné úrovne: ${SKILL_LEVELS.join(', ')}
Dostupné pohlavia: ${GENDER_OPTIONS.join(', ')}

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

Príklady:
"futbal v Košiciach" -> {"sportType": ["FOOTBALL"], "location": "Košice"}
"futbal na májovom námestí v Prešove" -> {"sportType": ["FOOTBALL"], "location": "Májové námestie Prešov"}
"tenis na základnej škole v Košiciach" -> {"sportType": ["TENNIS"], "location": "Základná škola Košice"}
"posilňovňa alebo fitness" -> {"sportType": ["GYM"]}
"začiatočnícka joga zadarmo" -> {"sportType": ["OTHER"], "skillLevel": "BEGINNER", "priceFrom": 0, "priceTo": 0}
"basketbal alebo volejbal dnes" -> {"sportType": ["BASKETBALL", "VOLLEYBALL"], "dateFrom": "2025-11-28", "dateTo": "2025-11-28"}
"aktivity pre ženy od 20 do 30 rokov" -> {"gender": "FEMALE", "minAge": 20, "maxAge": 30}

Vráť VÝHRADNE JSON objekt, žiadny iný text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Chyba pri parsovaní natural language query:', error);
    // Fallback: vráť query ako searchQuery
    return { searchQuery: query };
  }
}

/**
 * Generuje odporúčania aktivít na základe používateľského profilu a histórie
 */
export async function generateActivityRecommendations(userId: string, userProfile: {
  favoriteSports?: string[];
  city?: string;
  skillLevel?: string;
  age?: number;
  pastActivities?: Array<{ sportType: string; skillLevel: string }>;
}): Promise<{
  filters: Record<string, any>;
  explanation: string;
}> {
  if (!openai) {
    throw new Error('AI služba nie je dostupná.');
  }

  const systemPrompt = `Si AI asistent pre odporúčanie športových aktivít. Na základe používateľského profilu vygeneruj inteligentné filtre pre vyhľadávanie aktivít.

Dostupné typy športov: ${SPORT_TYPES.join(', ')}
Dostupné úrovne: ${SKILL_LEVELS.join(', ')} (BEGINNER=Začiatočník, INTERMEDIATE=Mierne pokročilý, ADVANCED=Pokročilý, EXPERT=Expert, PROFESSIONAL=Profesionál)

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
- Obľúbené športy: ${userProfile.favoriteSports?.join(', ') || 'žiadne'}
- Mesto: ${userProfile.city || 'neurčené'}
- Úroveň: ${userProfile.skillLevel || 'neurčená'}
- Vek: ${userProfile.age || 'neurčený'}
- Posledné aktivity: ${userProfile.pastActivities?.map(a => `${a.sportType} (${a.skillLevel})`).join(', ') || 'žiadne'}

Vygeneruj inteligentné odporúčania.`;

  try {
    const completion = await openai.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Chyba pri generovaní odporúčaní:', error);
    // Fallback: jednoduchý filter
    return {
      filters: {
        sportType: userProfile.favoriteSports || [],
        location: userProfile.city,
      },
      explanation: 'Odporúčame aktivity na základe tvojich obľúbených športov.'
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
  gender?: string;
  minAge?: number;
  maxAge?: number;
  suggestions?: string[];
}> {
  if (!openai) {
    throw new Error('AI služba nie je dostupná.');
  }

  const systemPrompt = `Si asistent pre vytváranie športových aktivít. Používateľ ti opíše, akú aktivitu chce vytvoriť v prirodzenom jazyku, a ty z toho vyextruješ štruktúrované dáta.

Dostupné typy športov: ${SPORT_TYPES.join(', ')}
Dostupné úrovne: ${SKILL_LEVELS.join(', ')} (BEGINNER=Začiatočník, INTERMEDIATE=Mierne pokročilý, ADVANCED=Pokročilý, EXPERT=Expert, PROFESSIONAL=Profesionál)
Dostupné pohlavia: ${GENDER_OPTIONS.join(', ')}

Vráť JSON objekt s nasledujúcimi poľami (všetky optional):
- title: string (názov aktivity)
- description: string (popis aktivity)
- sportType: string (FOOTBALL/BASKETBALL/TENNIS/VOLLEYBALL/BADMINTON/TABLE_TENNIS/RUNNING/CYCLING/SWIMMING/GYM/OTHER)
- skillLevel: string (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT/PROFESSIONAL)
- maxParticipants: number (koľko ľudí celkovo potrebuje, minimum 2 pre tímové športy)
- price: number (v eurách, predvolene 0 ak nie je uvedené)
- location: string (adresa alebo miesto)
- date: ISO date string (YYYY-MM-DD)
- time: time string (HH:MM) - začiatok aktivity
- duration: number (trvanie v minútach, ak je uvedené "od X do Y" vypočítaj rozdiel)
- gender: string (MALE/FEMALE/MIXED)
- minAge: number
- maxAge: number
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
-> {"title": "Basketbal pre profesionálov", "sportType": "BASKETBALL", "skillLevel": "PROFESSIONAL", "maxParticipants": 10, "price": 0, "gender": "MIXED"}

"Futbal pre ženy od 20 do 30 rokov v Prešove"
-> {"title": "Futbal pre ženy 20-30 rokov", "sportType": "FOOTBALL", "location": "Prešov", "gender": "FEMALE", "minAge": 20, "maxAge": 30, "maxParticipants": 14, "price": 0}

"Basketbal len pre chlapov 18+"
-> {"title": "Basketbal pre mužov 18+", "sportType": "BASKETBALL", "gender": "MALE", "minAge": 18, "maxAge": 99, "maxParticipants": 10, "price": 0}

"Detský tenis od 8 do 12 rokov"
-> {"title": "Detský tenis 8-12 rokov", "sportType": "TENNIS", "minAge": 8, "maxAge": 12, "maxParticipants": 4, "price": 0, "gender": "MIXED"}

"Kruhový tréning zajtra od 16:00 do 17:00 pre ženy od 15 rokov v 365 gyme v Prešove. Cena 5 eur."
-> {"title": "Kruhový tréning pre ženy 15+", "sportType": "GYM", "date": "2025-11-29", "time": "16:00", "duration": 60, "location": "365 Gym, Prešov", "gender": "FEMALE", "minAge": 15, "maxAge": 99, "price": 5, "maxParticipants": 15}

"Chcem si ísť zabehať do parku zajtra ráno"
-> {"title": "Ranný beh v parku", "sportType": "RUNNING", "maxParticipants": 5, "price": 0, "gender": "MIXED"}

"Hľadám parťáka na stolný tenis"
-> {"title": "Stolný tenis", "sportType": "TABLE_TENNIS", "maxParticipants": 2, "price": 0, "gender": "MIXED"}

"Joga pre baby od 25 rokov"
-> {"title": "Joga pre ženy 25+", "sportType": "OTHER", "gender": "FEMALE", "minAge": 25, "maxAge": 99, "maxParticipants": 10, "price": 0}

Vráť VÝHRADNE JSON objekt, žiadny iný text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Chyba pri parsovaní activity creation prompt:', error);
    return {
      suggestions: ['Skús zadať viac detailov o aktivite, ktorú chceš vytvoriť.']
    };
  }
}
