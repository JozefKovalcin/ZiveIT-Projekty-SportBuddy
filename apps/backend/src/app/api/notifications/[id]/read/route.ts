import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/notifications/[id]/read - Mark single notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notifikácia nenájdená" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 403 });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Chyba pri aktualizácii notifikácie" },
      { status: 500 }
    );
  }
}
