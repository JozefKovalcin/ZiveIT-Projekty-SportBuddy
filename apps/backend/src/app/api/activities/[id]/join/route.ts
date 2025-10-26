import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/activities/:id/join - Join an activity
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

    const activity = await prisma.activity.findUnique({
      where: { id: id },
      include: {
        participations: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    if (activity.status !== "OPEN") {
      return NextResponse.json(
        { error: "Aktivita nie je otvorená pre nových účastníkov" },
        { status: 400 }
      );
    }

    if (activity.currentParticipants >= activity.maxParticipants) {
      return NextResponse.json(
        { error: "Aktivita je už naplnená" },
        { status: 400 }
      );
    }

    // Check if user is already participating
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: id,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: "Už ste prihlásený na túto aktivitu" },
        { status: 400 }
      );
    }

    // Create participation
    const participation = await prisma.participation.create({
      data: {
        userId: session.user.id,
        activityId: id,
        status: "confirmed",
      },
    });

    // Update activity participant count
    const updatedActivity = await prisma.activity.update({
      where: { id: id },
      data: {
        currentParticipants: {
          increment: 1,
        },
        status:
          activity.currentParticipants + 1 >= activity.maxParticipants
            ? "FULL"
            : "OPEN",
      },
    });

    return NextResponse.json({ participation, activity: updatedActivity });
  } catch (error) {
    console.error("Error joining activity:", error);
    return NextResponse.json(
      { error: "Chyba pri prihlásení na aktivitu" },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/:id/join - Leave an activity
export async function DELETE(
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

    const activity = await prisma.activity.findUnique({
      where: { id: id },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    if (activity.organizerId === session.user.id) {
      return NextResponse.json(
        { error: "Organizátor nemôže opustiť vlastnú aktivitu" },
        { status: 400 }
      );
    }

    // Delete participation
    await prisma.participation.delete({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: id,
        },
      },
    });

    // Update activity participant count
    const updatedActivity = await prisma.activity.update({
      where: { id: id },
      data: {
        currentParticipants: {
          decrement: 1,
        },
        status: "OPEN",
      },
    });

    return NextResponse.json({ activity: updatedActivity });
  } catch (error) {
    console.error("Error leaving activity:", error);
    return NextResponse.json(
      { error: "Chyba pri opustení aktivity" },
      { status: 500 }
    );
  }
}
