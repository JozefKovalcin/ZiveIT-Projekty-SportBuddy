import { NextRequest, NextResponse } from 'next/server';
import { parseNaturalLanguageQuery, isAIEnabled } from '@/lib/openai';

/**
 * POST /api/ai/search
 * 
 * Parsuje prirodzený jazyk do štruktúrovaných filtrov
 * 
 * Body: { query: string }
 * Returns: { filters: {...}, originalQuery: string }
 */
export async function POST(req: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: 'AI služba nie je dostupná. Skontrolujte konfiguráciu.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Pole "query" je povinné a musí byť string.' },
        { status: 400 }
      );
    }

    const filters = await parseNaturalLanguageQuery(query);

    return NextResponse.json({
      filters,
      originalQuery: query,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Chyba v AI search:', error);
    return NextResponse.json(
      { error: error.message || 'Nastala chyba pri spracovaní dotazu.' },
      { status: 500 }
    );
  }
}
