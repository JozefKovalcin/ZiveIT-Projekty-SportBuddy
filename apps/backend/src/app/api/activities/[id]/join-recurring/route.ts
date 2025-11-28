import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/activities/:id/join-recurring - Bulk join recurring activities
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte byť prihlásený" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode, selectedDays, guestCount = 0 } = body;

    // mode: "all" | "specific-days"
    // selectedDays: array of numbers [0-6] (0=Sunday, 1=Monday, etc.)

    if (!mode || (mode === "specific-days" && (!selectedDays || selectedDays.length === 0))) {
      return NextResponse.json(
        { error: "Neplatné parametre" },
        { status: 400 }
      );
    }

    // Get the parent activity
    const parentActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!parentActivity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    // Get all upcoming instances (including parent if it's in future)
    let whereClause: any = {
      OR: [
        { id }, // parent activity
        { parentActivityId: id }, // child activities
      ],
      date: {
        gte: new Date(), // only upcoming
      },
      status: "OPEN", // only open activities
    };

    // Filter by specific days if mode is "specific-days"
    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        participations: {
          where: {
            userId: session.user.id,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // Filter by day of week if needed
    let activitiesToJoin = activities;
    if (mode === "specific-days") {
      activitiesToJoin = activities.filter((activity) => {
        const dayOfWeek = new Date(activity.date).getDay();
        return selectedDays.includes(dayOfWeek);
      });
    }

    // Filter out activities user already joined
    activitiesToJoin = activitiesToJoin.filter(
      (activity) => activity.participations.length === 0
    );

    // Filter out activities that don't have enough space
    const totalNeeded = 1 + guestCount;
    activitiesToJoin = activitiesToJoin.filter((activity) => {
      const availableSpots = activity.maxParticipants - activity.currentParticipants;
      return availableSpots >= totalNeeded;
    });

    if (activitiesToJoin.length === 0) {
      return NextResponse.json(
        { error: "Žiadne vhodné aktivity na prihlásenie" },
        { status: 400 }
      );
    }

    // Bulk join activities
    const participations = activitiesToJoin.map((activity) => ({
      userId: session.user.id,
      activityId: activity.id,
      status: "CONFIRMED" as const,
      guestCount,
    }));

    await prisma.participation.createMany({
      data: participations,
    });

    // Update participant counts for all activities
    const updatePromises = activitiesToJoin.map(async (activity) => {
      const newParticipantCount = activity.currentParticipants + totalNeeded;
      return prisma.activity.update({
        where: { id: activity.id },
        data: {
          currentParticipants: newParticipantCount,
          status: newParticipantCount >= activity.maxParticipants ? "FULL" : "OPEN",
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Prihlásený na ${activitiesToJoin.length} aktivít`,
      count: activitiesToJoin.length,
    });
  } catch (error) {
    console.error("Error bulk joining activities:", error);
    return NextResponse.json(
      { error: "Chyba pri hromadnom prihlásení" },
      { status: 500 }
    );
  }
}
