import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUsersAboutUserJoined, notifyUsersAboutUserLeft } from "@/lib/notification-service";

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

    // Parse request body for guest count
    let guestCount = 0;
    try {
      const body = await request.json();
      guestCount = body.guestCount || 0;
    } catch {
      // If no body, default to 0
      guestCount = 0;
    }

    if (guestCount < 0) {
      return NextResponse.json(
        { error: "Počet hostí nemôže byť záporný" },
        { status: 400 }
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
      if (existingParticipation.status === "BLOCKED") {
        return NextResponse.json(
          { error: "Boli ste zablokovaný organizátorom z tejto aktivity" },
          { status: 403 }
        );
      }

      // If already participating, update guest count
      const totalParticipants = 1 + guestCount; // user + guests
      const currentTotalWithoutThisUser = activity.currentParticipants - (1 + existingParticipation.guestCount);
      const newTotal = currentTotalWithoutThisUser + totalParticipants;
      
      const availableSpots = activity.maxParticipants - currentTotalWithoutThisUser;
      if (totalParticipants > availableSpots) {
        return NextResponse.json(
          { error: `K dispozícii je len ${availableSpots} voľných miest` },
          { status: 400 }
        );
      }

      // Update participation with new guest count
      await prisma.participation.update({
        where: {
          userId_activityId: {
            userId: session.user.id,
            activityId: id,
          },
        },
        data: {
          guestCount: guestCount,
        },
      });

      // Update activity participant count
      await prisma.activity.update({
        where: { id: id },
        data: {
          currentParticipants: newTotal,
          status: newTotal >= activity.maxParticipants ? "FULL" : "OPEN",
        },
      });

      return NextResponse.json({ 
        message: "Počet hostí aktualizovaný",
        guestCount: guestCount 
      });
    }

    // Check available spots (1 for user + guestCount)
    const totalNeeded = 1 + guestCount;
    const availableSpots = activity.maxParticipants - activity.currentParticipants;
    if (totalNeeded > availableSpots) {
      return NextResponse.json(
        { error: `K dispozícii je len ${availableSpots} voľných miest` },
        { status: 400 }
      );
    }

    // Create new participation
    await prisma.participation.create({
      data: {
        userId: session.user.id,
        activityId: id,
        status: "CONFIRMED",
        guestCount: guestCount,
      },
    });

    // Update activity participant count (user + guests)
    const newParticipantCount = activity.currentParticipants + totalNeeded;
    
    const updatedActivity = await prisma.activity.update({
      where: { id: id },
      data: {
        currentParticipants: newParticipantCount,
        status: newParticipantCount >= activity.maxParticipants ? "FULL" : "OPEN",
      },
    });

    // Notify organizer and participants
    notifyUsersAboutUserJoined(id, session.user.id).catch(console.error);

    return NextResponse.json({ activity: updatedActivity });
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

    // Check participation exists
    const participation = await prisma.participation.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: id,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Nie ste prihlásený na túto aktivitu" },
        { status: 400 }
      );
    }

    // Calculate total participants to remove (user + guests)
    const totalToRemove = 1 + participation.guestCount;

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
          decrement: totalToRemove,
        },
        status: "OPEN",
      },
    });

    // Notify organizer and participants
    notifyUsersAboutUserLeft(id, session.user.id).catch(console.error);

    return NextResponse.json({ activity: updatedActivity });
  } catch (error) {
    console.error("Error leaving activity:", error);
    return NextResponse.json(
      { error: "Chyba pri opustení aktivity" },
      { status: 500 }
    );
  }
}

