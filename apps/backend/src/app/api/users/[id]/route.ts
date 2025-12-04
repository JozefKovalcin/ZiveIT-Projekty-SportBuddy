import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/users/[id] - Get public user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // Fetch user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            city: true,
            phone: true,
            skillLevel: true,
            favoriteSports: true,
            footballSkill: true,
            basketballSkill: true,
            tennisSkill: true,
            volleyballSkill: true,
            badmintonSkill: true,
            tableTennisSkill: true,
            runningSkill: true,
            cyclingSkill: true,
            swimmingSkill: true,
            gymSkill: true,
          },
        },
        _count: {
          select: {
            activities: true, // Created activities
            participations: true, // Joined activities
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Používateľ nenájdený" },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const completedActivities = await prisma.activity.count({
      where: {
        OR: [
          { organizerId: userId, status: "COMPLETED" },
          {
            participations: {
              some: { userId },
            },
            status: "COMPLETED",
          },
        ],
      },
    });

    const upcomingActivities = await prisma.activity.count({
      where: {
        OR: [
          { organizerId: userId, status: "OPEN" },
          {
            participations: {
              some: { userId },
            },
            status: "OPEN",
          },
        ],
        date: {
          gte: new Date(),
        },
      },
    });

    // Get sport type distribution from activities
    const organizedActivities = await prisma.activity.findMany({
      where: { organizerId: userId },
      select: { sportType: true },
    });

    const participatedActivities = await prisma.activity.findMany({
      where: {
        participations: {
          some: { userId },
        },
      },
      select: { sportType: true },
    });

    // Count sport types
    const allSports = [
      ...organizedActivities.map((a) => a.sportType),
      ...participatedActivities.map((a) => a.sportType),
    ];

    const sportCounts = allSports.reduce((acc, sport) => {
      acc[sport] = (acc[sport] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get most played sports (top 3)
    const mostPlayedSports = Object.entries(sportCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([sport]) => sport);

    // Get average rating for activities organized by this user
    const userActivities = await prisma.activity.findMany({
      where: { organizerId: userId },
      select: { id: true },
    });

    const activityIds = userActivities.map((a) => a.id);

    const ratingsAggregate = await prisma.activityRating.aggregate({
      where: {
        activityId: { in: activityIds },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = ratingsAggregate._avg.rating
      ? Math.round(ratingsAggregate._avg.rating * 10) / 10
      : null;
    const totalRatings = ratingsAggregate._count.rating;

    return NextResponse.json({
      ...user,
      stats: {
        totalActivities: user._count.activities + user._count.participations,
        createdActivities: user._count.activities,
        joinedActivities: user._count.participations,
        completedActivities,
        upcomingActivities,
        mostPlayedSports,
        averageRating,
        totalRatings,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní profilu" },
      { status: 500 }
    );
  }
}
