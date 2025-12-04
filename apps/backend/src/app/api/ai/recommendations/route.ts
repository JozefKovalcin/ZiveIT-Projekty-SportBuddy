import { NextRequest, NextResponse } from "next/server";
import { generateActivityRecommendations, isAIEnabled } from "@/lib/openai";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ai/recommendations
 *
 * Generuje personalizované odporúčania aktivít na základe používateľského profilu
 *
 * Returns: { filters: {...}, explanation: string, activities: [...] }
 */
export async function GET(req: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI služba nie je dostupná. Skontrolujte konfiguráciu." },
        { status: 503 }
      );
    }

    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte byť prihlásený." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Načítaj používateľský profil
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        city: true,
        favoriteSports: true,
        bio: true,
        participations: {
          include: {
            activity: {
              select: {
                sportType: true,
                skillLevel: true,
                date: true,
              },
            },
          },
          orderBy: {
            joinedAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Používateľ nebol nájdený." },
        { status: 404 }
      );
    }

    // Priprav profil pre AI
    const userProfile = {
      favoriteSports: user.favoriteSports || [],
      city: user.city || undefined,
      pastActivities: user.participations.map((p) => ({
        sportType: p.activity.sportType,
        skillLevel: p.activity.skillLevel,
      })),
    };

    // Vygeneruj odporúčania
    const recommendations = await generateActivityRecommendations(
      userId,
      userProfile
    );

    // Načítaj aktivity podľa vygenerovaných filtrov
    const activities = await prisma.activity.findMany({
      where: {
        AND: [
          { status: "OPEN" },
          { date: { gte: new Date() } },
          recommendations.filters.sportType
            ? {
                sportType: { in: recommendations.filters.sportType },
              }
            : {},
          recommendations.filters.location
            ? {
                location: {
                  contains: recommendations.filters.location,
                  mode: "insensitive",
                },
              }
            : {},
          recommendations.filters.skillLevel
            ? {
                skillLevel: recommendations.filters.skillLevel,
              }
            : {},
        ],
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            participations: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
      take: 10,
    });

    return NextResponse.json({
      filters: recommendations.filters,
      explanation: recommendations.explanation,
      activities: activities.map((activity) => ({
        ...activity,
        currentParticipants: activity._count.participations,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chyba v AI recommendations:", error);
    return NextResponse.json(
      { error: error.message || "Nastala chyba pri generovaní odporúčaní." },
      { status: 500 }
    );
  }
}
