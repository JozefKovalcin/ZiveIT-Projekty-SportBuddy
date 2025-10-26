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
            skillLevel: true,
          },
        },
        participations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                skillLevel: true,
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
