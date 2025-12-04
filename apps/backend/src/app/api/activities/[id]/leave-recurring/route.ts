import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/activities/:id/leave-recurring - Bulk leave recurring activities
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
    const { mode, selectedDays } = body;

    // mode: "all" | "specific-days"
    // selectedDays: array of numbers [0-6] (0=Sunday, 1=Monday, etc.)

    if (
      !mode ||
      (mode === "specific-days" && (!selectedDays || selectedDays.length === 0))
    ) {
      return NextResponse.json(
        { error: "Neplatné parametre" },
        { status: 400 }
      );
    }

    // Get the activity (could be parent or child)
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    // Determine the parent activity ID (either this activity is parent, or we find its parent)
    const parentActivityId = activity.parentActivityId || activity.id;

    // Get all upcoming instances (including parent if it's in future) where user is participating
    let whereClause: any = {
      OR: [
        { id: parentActivityId }, // parent activity
        { parentActivityId: parentActivityId }, // child activities
      ],
      date: {
        gte: new Date(), // only upcoming
      },
    };

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

    // Filter to only activities user is participating in
    let activitiesToLeave = activities.filter(
      (activity) => activity.participations.length > 0
    );

    // Filter by day of week if mode is "specific-days"
    if (mode === "specific-days") {
      activitiesToLeave = activitiesToLeave.filter((activity) => {
        const dayOfWeek = new Date(activity.date).getDay();
        return selectedDays.includes(dayOfWeek);
      });
    }

    if (activitiesToLeave.length === 0) {
      return NextResponse.json(
        { error: "Nie ste prihlásený na žiadne z týchto aktivít" },
        { status: 400 }
      );
    }

    // Delete participations and update counts for each activity
    const leavePromises = activitiesToLeave.map(async (activity) => {
      const participation = activity.participations[0];
      const totalToRemove = 1 + (participation.guestCount || 0);

      // Delete the participation
      await prisma.participation.delete({
        where: { id: participation.id },
      });

      // Update the activity participant count
      const newParticipantCount = Math.max(
        0,
        activity.currentParticipants - totalToRemove
      );
      return prisma.activity.update({
        where: { id: activity.id },
        data: {
          currentParticipants: newParticipantCount,
          status:
            newParticipantCount < activity.maxParticipants ? "OPEN" : "FULL",
        },
      });
    });

    await Promise.all(leavePromises);

    return NextResponse.json({
      message: `Odhlásený z ${activitiesToLeave.length} aktivít`,
      count: activitiesToLeave.length,
    });
  } catch (error) {
    console.error("Error bulk leaving activities:", error);
    return NextResponse.json(
      { error: "Chyba pri hromadnom odhlásení" },
      { status: 500 }
    );
  }
}
