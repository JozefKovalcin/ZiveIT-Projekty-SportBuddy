import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/activities/my - Get current user's activities (created and joined)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get activities created by user
    const createdActivities = await prisma.activity.findMany({
      where: {
        organizerId: userId,
      },
      include: {
        venue: true,
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
        date: 'asc',
      },
    });

    // Get activities user joined (including those they organized if they also joined)
    const joinedActivities = await prisma.activity.findMany({
      where: {
        participations: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        venue: true,
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
        date: 'asc',
      },
    });

    return NextResponse.json({
      created: createdActivities,
      joined: joinedActivities,
      stats: {
        totalCreated: createdActivities.length,
        totalJoined: joinedActivities.length,
        upcomingCreated: createdActivities.filter((a: any) => new Date(a.date) > new Date()).length,
        upcomingJoined: joinedActivities.filter((a: any) => new Date(a.date) > new Date()).length,
      },
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
