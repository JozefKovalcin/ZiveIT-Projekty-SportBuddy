import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/activities/:id/instances - Get all instances of a recurring activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First get the activity to check if it's recurring
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: {
        id: true,
        isRecurring: true,
        parentActivityId: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nenájdená" },
        { status: 404 }
      );
    }

    // Determine the parent activity ID
    // If this is a child activity, use its parent. Otherwise, use this activity's ID
    const parentId = activity.parentActivityId || activity.id;

    // Get the parent activity
    const parentActivity = await prisma.activity.findUnique({
      where: { id: parentId },
      select: {
        id: true,
        date: true,
        status: true,
        currentParticipants: true,
        maxParticipants: true,
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

    // Get all child activities
    const childActivities = await prisma.activity.findMany({
      where: {
        parentActivityId: parentId,
      },
      select: {
        id: true,
        date: true,
        status: true,
        currentParticipants: true,
        maxParticipants: true,
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

    // Combine parent and children, filter for future dates
    const now = new Date();
    const allInstances = [parentActivity, ...childActivities]
      .filter(
        (instance): instance is NonNullable<typeof instance> =>
          instance !== null && new Date(instance.date) >= now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json({
      instances: allInstances,
      parentId,
      totalCount: allInstances.length,
    });
  } catch (error) {
    console.error("Error fetching recurring instances:", error);
    return NextResponse.json(
      { error: "Interná chyba servera" },
      { status: 500 }
    );
  }
}
