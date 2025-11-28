import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id]/activities - Get user's activities (organized + participated)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Používateľ nenájdený" },
        { status: 404 }
      );
    }

    // Get query params for filtering
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // OPEN, COMPLETED, etc.
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build where clause
    const whereClause: any = {
      OR: [
        { organizerId: userId },
        {
          participations: {
            some: { userId },
          },
        },
      ],
    };

    if (status) {
      whereClause.status = status;
    }

    // Fetch activities
    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
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
        venue: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Add flag to indicate if user is organizer
    const activitiesWithRole = activities.map((activity) => ({
      ...activity,
      isOrganizer: activity.organizerId === userId,
      isParticipant: activity.participations.some((p) => p.userId === userId),
    }));

    return NextResponse.json(activitiesWithRole);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní aktivít" },
      { status: 500 }
    );
  }
}
