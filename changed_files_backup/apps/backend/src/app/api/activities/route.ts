import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const activitySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  sportType: z.enum([
    "FOOTBALL",
    "BASKETBALL",
    "TENNIS",
    "VOLLEYBALL",
    "BADMINTON",
    "TABLE_TENNIS",
    "RUNNING",
    "CYCLING",
    "SWIMMING",
    "GYM",
    "OTHER",
  ]),
  skillLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
  date: z.string().datetime(),
  duration: z.number().min(15).max(480),
  maxParticipants: z.number().min(2).max(50),
  location: z.string().min(1), // Google Maps address
  locationName: z.string().optional(), // Custom location name
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  venueId: z.string().optional(), // Now optional
  gender: z.enum(["MALE", "FEMALE", "MIXED"]).default("MIXED"),
  minAge: z.number().min(6).max(99).default(18),
  maxAge: z.number().min(6).max(99).default(99),
  price: z.number().min(0).default(0),
  isPublic: z.boolean().default(true),
  // Recurrence fields
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"]).default("NONE"),
  recurrenceDays: z.array(z.number().min(0).max(6)).default([]), // 0=Sunday, 1=Monday, etc.
  recurrenceEndDate: z.string().datetime().optional(),
  autoJoinAll: z.boolean().default(false),
  autoJoinGuestCount: z.number().min(0).max(10).default(0),
}).refine((data) => data.minAge <= data.maxAge, {
  message: "Minimálny vek musí byť menší alebo rovný maximálnemu veku",
  path: ["minAge"],
}).refine((data) => {
  if (data.isRecurring && data.recurrenceFrequency === "WEEKLY" && data.recurrenceDays.length === 0) {
    return false;
  }
  return true;
}, {
  message: "Pre týždenné opakovanie musíte vybrať aspoň jeden deň v týždni",
  path: ["recurrenceDays"],
});

// GET /api/activities - Get all activities with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Search parameter
    const search = searchParams.get("search");

    // Filter parameters
    const sportType = searchParams.get("sportType");
    const city = searchParams.get("city");
    const status = searchParams.get("status") || "OPEN";
    const skillLevel = searchParams.get("skillLevel");
    const gender = searchParams.get("gender");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: any = {
      status: status as any,
      parentActivityId: null, // Only show parent activities, not recurring instances
      date: {
        gte: dateFrom ? new Date(dateFrom) : new Date(),
        ...(dateTo && { lte: new Date(dateTo) }),
      },
    };

    // Full-text search on title and description
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { location: { contains: search.trim(), mode: "insensitive" } },
        { locationName: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    // Apply filters
    if (sportType) where.sportType = sportType as any;
    if (skillLevel) where.skillLevel = skillLevel as any;
    if (gender) where.gender = gender as any;

    // Price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Age range (user age must fit within activity's age range)
    if (minAge) where.maxAge = { gte: parseInt(minAge) };
    if (maxAge) where.minAge = { lte: parseInt(maxAge) };

    // City filter (if venue exists)
    if (city) {
      where.venue = { city };
    }

    const activities = await prisma.activity.findMany({
      where,
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
        date: "asc",
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní aktivít" },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Musíte byť prihlásený" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = activitySchema.parse(body);

    // Extract auto-join settings before creating activity
    const { autoJoinAll, autoJoinGuestCount, ...activityFields } = validatedData;

    // Create base activity data
    const activityData: any = {
      ...activityFields,
      date: new Date(validatedData.date),
      organizerId: session.user.id,
      currentParticipants: 1 + (autoJoinGuestCount || 0), // 1 for organizer + guests
      recurrenceEndDate: validatedData.recurrenceEndDate 
        ? new Date(validatedData.recurrenceEndDate) 
        : undefined,
    };

    const activity = await prisma.activity.create({
      data: activityData,
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

    // Automatically add organizer as participant
    await prisma.participation.create({
      data: {
        userId: session.user.id,
        activityId: activity.id,
        status: "CONFIRMED",
        guestCount: validatedData.autoJoinAll ? validatedData.autoJoinGuestCount : 0,
      },
    });

    // If recurring, create future instances
    if (activity.isRecurring && activity.recurrenceFrequency !== "NONE") {
      await createRecurringActivities(activity, session.user.id, validatedData.autoJoinAll, validatedData.autoJoinGuestCount);
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatné údaje", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Chyba pri vytváraní aktivity" },
      { status: 500 }
    );
  }
}

// Helper function to create recurring activities
async function createRecurringActivities(parentActivity: any, userId: string, autoJoinAll: boolean, guestCount: number) {
  const maxInstances = 20; // Maximum 20 instances
  let instancesCreated = 0;
  // Calculate end date from the activity's start date, not from today
  const parentDate = new Date(parentActivity.date);
  // Default to 2 months from activity date (not 60 days, but actual 2 months)
  let defaultEndDate = new Date(parentDate);
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 2);
  const endDate = parentActivity.recurrenceEndDate || defaultEndDate;
  
  console.log(`Creating recurring activities from ${parentDate.toISOString()} until ${endDate.toISOString()}`);
  
  let currentDate = new Date(parentActivity.date);
  
  while (instancesCreated < maxInstances && currentDate < endDate) {
    // Calculate next occurrence based on frequency
    if (parentActivity.recurrenceFrequency === "DAILY") {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (parentActivity.recurrenceFrequency === "WEEKLY") {
      // Find next matching day of week
      let daysToAdd = 1;
      let nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      
      while (!parentActivity.recurrenceDays.includes(nextDate.getDay()) && daysToAdd < 8) {
        daysToAdd++;
        nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      }
      
      currentDate = nextDate;
    } else if (parentActivity.recurrenceFrequency === "MONTHLY") {
      // Safe month addition that handles year boundaries
      const targetMonth = currentDate.getMonth() + 1;
      const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12);
      const actualMonth = targetMonth % 12;
      currentDate = new Date(targetYear, actualMonth, currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes());
    }
    
    console.log(`Next occurrence: ${currentDate.toISOString()}, end date: ${endDate.toISOString()}, passed: ${currentDate >= endDate}`);
    
    // Stop if we've passed the end date
    if (currentDate >= endDate) break;
    
    // Create child activity
    try {
      const childActivity = await prisma.activity.create({
        data: {
          title: parentActivity.title,
          description: parentActivity.description,
          sportType: parentActivity.sportType,
          skillLevel: parentActivity.skillLevel,
          date: new Date(currentDate),
          duration: parentActivity.duration,
          maxParticipants: parentActivity.maxParticipants,
          gender: parentActivity.gender,
          minAge: parentActivity.minAge,
          maxAge: parentActivity.maxAge,
          price: parentActivity.price,
          location: parentActivity.location,
          locationName: parentActivity.locationName,
          latitude: parentActivity.latitude,
          longitude: parentActivity.longitude,
          venueId: parentActivity.venueId,
          organizerId: parentActivity.organizerId,
          isPublic: parentActivity.isPublic,
          isRecurring: false, // Child activities are not recurring
          recurrenceFrequency: "NONE",
          parentActivityId: parentActivity.id,
          currentParticipants: autoJoinAll ? 1 + guestCount : 0, // 1 for organizer + guests
        },
      });
      
      // Auto-join organizer if requested
      if (autoJoinAll) {
        await prisma.participation.create({
          data: {
            userId: userId,
            activityId: childActivity.id,
            status: "CONFIRMED",
            guestCount: guestCount,
          },
        });
      }
      
      instancesCreated++;
    } catch (error) {
      console.error("Error creating recurring instance:", error);
      break;
    }
  }
  
  console.log(`Created ${instancesCreated} recurring activity instances`);
}
