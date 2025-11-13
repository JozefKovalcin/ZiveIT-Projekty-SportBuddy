import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activities/[id]/upcoming - Get upcoming recurring instances
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // First check if this is a parent recurring activity
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { 
        id: true, 
        isRecurring: true,
        recurrenceFrequency: true,
        parentActivityId: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    // Determine the parent ID (either this activity or its parent)
    const parentId = activity.parentActivityId || id;
    const isRecurring = activity.parentActivityId 
      ? true // If it has a parent, it's a child of recurring activity
      : activity.isRecurring && activity.recurrenceFrequency !== "NONE";

    // If it's a recurring activity (or child of one), find all instances
    if (isRecurring) {
      const upcomingInstances = await prisma.activity.findMany({
        where: {
          OR: [
            { id: parentId }, // Include the parent
            { parentActivityId: parentId }, // Include all children
          ],
          date: {
            gte: new Date(), // Only future dates
          },
          status: "OPEN", // Only open activities
        },
        include: {
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
        take: 10, // Limit to next 10 instances
      });

      return NextResponse.json(upcomingInstances);
    }

    // If not recurring, return empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching upcoming instances:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní nadchádzajúcich termínov" },
      { status: 500 }
    );
  }
}
