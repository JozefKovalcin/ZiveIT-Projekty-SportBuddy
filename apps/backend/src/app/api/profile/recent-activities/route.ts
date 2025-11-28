import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/profile/recent-activities - Get current user's recent activities
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get 5 most recent activities (created or joined)
    const createdActivities = await prisma.activity.findMany({
      where: { organizerId: session.user.id },
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        sportType: true,
        date: true,
      },
    });

    const joinedActivities = await prisma.participation.findMany({
      where: { userId: session.user.id },
      orderBy: { activity: { date: 'desc' } },
      take: 5,
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            sportType: true,
            date: true,
          },
        },
      },
    });

    // Combine and format
    const recentActivities = [
      ...createdActivities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        sportType: activity.sportType,
        date: activity.date.toISOString(),
        type: 'created' as const,
      })),
      ...joinedActivities.map((participation) => ({
        id: participation.activity.id,
        title: participation.activity.title,
        sportType: participation.activity.sportType,
        date: participation.activity.date.toISOString(),
        type: 'joined' as const,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
