import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// GET /api/activities/[id]/messages - Get all messages for activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: activityId } = await params;

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nebola nájdená" },
        { status: 404 }
      );
    }

    // Get messages with pagination (optional query params)
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const messages = await prisma.message.findMany({
      where: { activityId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní správ" },
      { status: 500 }
    );
  }
}

// POST /api/activities/[id]/messages - Create new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Musíte byť prihlásený" },
        { status: 401 }
      );
    }

    const { id: activityId } = await params;
    const body = await request.json();
    const { content } = body;

    // Validation
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Obsah správy je povinný" },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { error: "Správa nemôže byť prázdna" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Správa je príliš dlhá (max 500 znakov)" },
        { status: 400 }
      );
    }

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivita nebola nájdená" },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        activityId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Chyba pri vytváraní správy" },
      { status: 500 }
    );
  }
}
