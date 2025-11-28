import { NextRequest, NextResponse } from 'next/server';
import { parseActivityCreationPrompt, isAIEnabled } from '@/lib/openai';

/**
 * POST /api/ai/create-activity
 * 
 * Parsuje prirodzený jazyk do štruktúrovaných dát pre vytvorenie aktivity
 * 
 * Body: { prompt: string }
 * Returns: { activityData: {...}, suggestions: [...] }
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
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Pole "prompt" je povinné a musí byť string.' },
        { status: 400 }
      );
    }

    const activityData = await parseActivityCreationPrompt(prompt);

    return NextResponse.json({
      activityData,
      originalPrompt: prompt,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Chyba v AI create-activity:', error);
    return NextResponse.json(
      { error: error.message || 'Nastala chyba pri spracovaní požiadavky.' },
      { status: 500 }
    );
  }
}
