import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { z } from "zod";

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// GET - fetch user's rating for this activity
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const activityId = id;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ rating: null }, { status: 200 });
    }

    const existingRating = await prisma.activityRating.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: activityId,
        },
      },
    });

    return NextResponse.json(
      {
        rating: existingRating?.rating || null,
        comment: existingRating?.comment || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching rating:", error);
    return NextResponse.json({ rating: null }, { status: 200 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const activityId = id;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = ratingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { rating, comment } = validation.data;

    // Check participation
    const participation = await prisma.participation.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: activityId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: "Must be a participant to rate" },
        { status: 403 }
      );
    }

    // Upsert rating
    const newRating = await prisma.activityRating.upsert({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: activityId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        userId: session.user.id,
        activityId,
        rating,
        comment,
      },
    });

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
