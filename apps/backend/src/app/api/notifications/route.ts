import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: any = { userId: session.user.id };
    if (unreadOnly) where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              sportType: true,
              date: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Chyba pri načítaní notifikácií" },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete all notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json(
      { error: "Chyba pri mazaní notifikácií" },
      { status: 500 }
    );
  }
}
