import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const activitySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  sportType: z.enum([
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
  ]),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  date: z.string().datetime(),
  duration: z.number().min(15).max(480),
  maxParticipants: z.number().min(2).max(50),
  venueId: z.string(),
  isPublic: z.boolean().default(true),
});

// GET /api/activities - Get all activities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sportType = searchParams.get("sportType");
    const city = searchParams.get("city");
    const status = searchParams.get("status") || "OPEN";

    const activities = await prisma.activity.findMany({
      where: {
        ...(sportType && { sportType: sportType as any }),
        status: status as any,
        ...(city && {
          venue: {
            city: city,
          },
        }),
        date: {
          gte: new Date(),
        },
      },
      include: {
        venue: true,
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        participations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní aktivít" },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte byť prihlásený" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = activitySchema.parse(body);

    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        organizerId: session.user.id,
        currentParticipants: 1,
      },
      include: {
        venue: true,
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Automatically add organizer as participant
    await prisma.participation.create({
      data: {
        userId: session.user.id,
        activityId: activity.id,
        status: "CONFIRMED",
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatné údaje", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Chyba pri vytváraní aktivity" },
      { status: 500 }
    );
  }
}
