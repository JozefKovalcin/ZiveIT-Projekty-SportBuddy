import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const venueSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  sportTypes: z.array(z.string()),
  amenities: z.array(z.string()).optional(),
  priceRange: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  image: z.string().url().optional(),
});

// GET /api/venues - Get all venues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const sportType = searchParams.get("sportType");

    const venues = await prisma.venue.findMany({
      where: {
        ...(city && { city }),
        ...(sportType && {
          sportTypes: {
            has: sportType as any,
          },
        }),
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            activities: true,
            reviews: true,
          },
        },
      },
    });

    // Calculate average rating for each venue
    const venuesWithRating = venues.map((venue) => ({
      ...venue,
      averageRating:
        venue.reviews.length > 0
          ? venue.reviews.reduce((sum, r) => sum + r.rating, 0) /
            venue.reviews.length
          : 0,
    }));

    return NextResponse.json(venuesWithRating);
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní športovísk" },
      { status: 500 }
    );
  }
}

// POST /api/venues - Create new venue (admin only for now)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = venueSchema.parse(body);

    const venue = await prisma.venue.create({
      data: validatedData as any,
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Neplatné údaje", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating venue:", error);
    return NextResponse.json(
      { error: "Chyba pri vytváraní športoviska" },
      { status: 500 }
    );
  }
}
