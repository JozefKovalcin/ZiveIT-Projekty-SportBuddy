import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const preferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailFrequency: z.enum(["INSTANT", "DAILY_DIGEST", "WEEKLY_DIGEST", "NONE"]).optional(),
  pushEnabled: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  notifyNewActivities: z.boolean().optional(),
  notifyReminders: z.boolean().optional(),
  notifyParticipants: z.boolean().optional(),
  notifyActivityFull: z.boolean().optional(),
  onlyFavoriteSports: z.boolean().optional(),
  maxDistance: z.number().min(1).max(100).nullable().optional(),
  maxPrice: z.number().min(0).nullable().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.number().min(0).max(23).optional(),
  quietHoursEnd: z.number().min(0).max(23).optional(),
  maxNotificationsPerDay: z.number().min(1).max(100).optional(),
});

// GET /api/notifications/preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId: session.user.id },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Chyba pri načítaní nastavení" }, { status: 500 });
  }
}

// PUT /api/notifications/preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: { userId: session.user.id, ...validatedData },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Neplatné údaje", details: error.issues }, { status: 400 });
    }
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Chyba pri ukladaní nastavení" }, { status: 500 });
  }
}
