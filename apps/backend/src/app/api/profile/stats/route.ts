import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET /api/profile/stats - Get current user's activity statistics
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Count upcoming activities (as organizer or participant)
    const upcomingCreated = await prisma.activity.count({
      where: {
        organizerId: session.user.id,
        date: { gte: now },
        status: 'OPEN',
      },
    });

    const upcomingJoined = await prisma.participation.count({
      where: {
        userId: session.user.id,
        activity: {
          date: { gte: now },
          status: 'OPEN',
        },
      },
    });

    // Count total completed activities
    const totalCreated = await prisma.activity.count({
      where: {
        organizerId: session.user.id,
        date: { lt: now },
      },
    });

    const totalJoined = await prisma.participation.count({
      where: {
        userId: session.user.id,
        activity: {
          date: { lt: now },
        },
      },
    });

    // Calculate total hours spent in activities
    const createdActivities = await prisma.activity.findMany({
      where: {
        organizerId: session.user.id,
        date: { lt: now },
      },
      select: { duration: true },
    });

    const joinedActivities = await prisma.activity.findMany({
      where: {
        participations: {
          some: { userId: session.user.id },
        },
        date: { lt: now },
      },
      select: { duration: true },
    });

    const totalHours = Math.round(
      [...createdActivities, ...joinedActivities].reduce(
        (sum, activity) => sum + activity.duration,
        0
      ) / 60
    );

    // Count unique partners (users met in activities)
    const participatedActivities = await prisma.activity.findMany({
      where: {
        OR: [
          { organizerId: session.user.id },
          { participations: { some: { userId: session.user.id } } },
        ],
        date: { lt: now },
      },
      include: {
        organizer: true,
        participations: {
          include: { user: true },
        },
      },
    });

    const uniquePartnerIds = new Set<string>();
    participatedActivities.forEach((activity) => {
      // Add organizer if not current user
      if (activity.organizerId !== session.user.id) {
        uniquePartnerIds.add(activity.organizerId);
      }
      // Add participants if not current user
      activity.participations.forEach((p) => {
        if (p.userId !== session.user.id) {
          uniquePartnerIds.add(p.userId);
        }
      });
    });

    return NextResponse.json({
      upcomingActivities: upcomingCreated + upcomingJoined,
      totalActivities: totalCreated + totalJoined,
      totalHours,
      uniquePartners: uniquePartnerIds.size,
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
