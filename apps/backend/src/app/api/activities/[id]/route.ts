import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activities/:id - Get activity by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await prisma.activity.findUnique({
      where: {
        id: id,
      },
      include: {
        venue: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
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
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní aktivity" },
      { status: 500 }
    );
  }
}

// PUT /api/activities/:id - Update activity
export async function PUT(
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

    if (activity.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Nemáte oprávnenie upraviť túto aktivitu" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updatedActivity = await prisma.activity.update({
      where: { id: id },
      data: body,
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

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Chyba pri aktualizácii aktivity" },
      { status: 500 }
    );
  }
}

// DELETE /api/activities/:id - Delete activity
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

    if (activity.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Nemáte oprávnenie zmazať túto aktivitu" },
        { status: 403 }
      );
    }

    // If this is a parent activity, handle child activities
    if (activity.isRecurring && activity.recurrenceFrequency !== "NONE") {
      const childActivities = await prisma.activity.findMany({
        where: { parentActivityId: id },
        orderBy: { date: 'asc' },
      });

      if (childActivities.length === 1) {
        // Only 1 child remains - make it standalone
        await prisma.activity.update({
          where: { id: childActivities[0].id },
          data: { parentActivityId: null },
        });
      } else if (childActivities.length > 1) {
        // Multiple children remain - promote first child to new parent
        const newParent = childActivities[0];
        await prisma.activity.update({
          where: { id: newParent.id },
          data: {
            isRecurring: true,
            recurrenceFrequency: activity.recurrenceFrequency,
            recurrenceDays: activity.recurrenceDays,
            recurrenceEndDate: activity.recurrenceEndDate,
            parentActivityId: null,
          },
        });

        // Update remaining children to point to new parent
        for (let i = 1; i < childActivities.length; i++) {
          await prisma.activity.update({
            where: { id: childActivities[i].id },
            data: { parentActivityId: newParent.id },
          });
        }
      }
    }

    // If this is a child activity, check remaining siblings
    if (activity.parentActivityId) {
      const siblings = await prisma.activity.findMany({
        where: { 
          parentActivityId: activity.parentActivityId,
          id: { not: id }, // Exclude current activity being deleted
        },
      });

      // If only one sibling remains after deletion, remove its parentActivityId
      if (siblings.length === 1) {
        await prisma.activity.update({
          where: { id: siblings[0].id },
          data: { parentActivityId: null },
        });
      }
    }

    await prisma.activity.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Aktivita bola zmazaná" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Chyba pri mazaní aktivity" },
      { status: 500 }
    );
  }
}
