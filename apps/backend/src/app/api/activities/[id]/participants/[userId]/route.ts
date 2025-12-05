import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";

// DELETE /api/activities/:id/participants/:userId - Remove (kick) a participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
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

    // Only organizer can remove participants
    if (activity.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Nemáte oprávnenie na túto akciu" },
        { status: 403 }
      );
    }

    // Check participation exists
    const participation = await prisma.participation.findUnique({
      where: {
        userId_activityId: {
          userId: userId,
          activityId: id,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Používateľ nie je prihlásený na túto aktivitu" },
        { status: 404 }
      );
    }

    // Calculate total participants to remove (user + guests)
    const totalToRemove = 1 + participation.guestCount;

    // Delete participation (Kick)
    await prisma.participation.delete({
      where: {
        userId_activityId: {
          userId: userId,
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
        status: "OPEN", // Always open up spots if someone is removed
      },
    });

    // Notify the removed user
    await createNotification({
      userId: userId,
      type: "SYSTEM",
      title: "Boli ste odhlásený z aktivity",
      message: `Organizátor vás odhlásil z aktivity "${activity.title}".`,
      activityId: id,
    });

    return NextResponse.json({ message: "Účastník bol odstránený", activity: updatedActivity });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Chyba pri odstraňovaní účastníka" },
      { status: 500 }
    );
  }
}

// PATCH /api/activities/:id/participants/:userId - Block a participant
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
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

    // Only organizer can block participants
    if (activity.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Nemáte oprávnenie na túto akciu" },
        { status: 403 }
      );
    }

    // Check participation exists
    const participation = await prisma.participation.findUnique({
      where: {
        userId_activityId: {
          userId: userId,
          activityId: id,
        },
      },
    });

    if (!participation) {
      // If not participating, create a BLOCKED participation
      // This prevents them from joining in the future
      await prisma.participation.create({
        data: {
          userId: userId,
          activityId: id,
          status: "BLOCKED",
          guestCount: 0,
        },
      });
      
      return NextResponse.json({ message: "Používateľ bol zablokovaný" });
    }

    // If participating, change status to BLOCKED and update counts
    const totalToRemove = 1 + participation.guestCount;

    await prisma.participation.update({
      where: {
        userId_activityId: {
          userId: userId,
          activityId: id,
        },
      },
      data: {
        status: "BLOCKED",
        guestCount: 0, // Reset guest count as they are no longer attending
      },
    });

    // Update activity participant count
    // Only decrement if they were previously CONFIRMED (or PENDING)
    // If they were already BLOCKED or CANCELLED, we shouldn't decrement
    if (participation.status === "CONFIRMED" || participation.status === "PENDING") {
      await prisma.activity.update({
        where: { id: id },
        data: {
          currentParticipants: {
            decrement: totalToRemove,
          },
          status: "OPEN",
        },
      });
    }

    // Notify the blocked user
    await createNotification({
      userId: userId,
      type: "SYSTEM",
      title: "Boli ste zablokovaný z aktivity",
      message: `Organizátor vás zablokoval z aktivity "${activity.title}".`,
      activityId: id,
    });

    return NextResponse.json({ message: "Účastník bol zablokovaný" });
  } catch (error) {
    console.error("Error blocking participant:", error);
    return NextResponse.json(
      { error: "Chyba pri blokovaní účastníka" },
      { status: 500 }
    );
  }
}
