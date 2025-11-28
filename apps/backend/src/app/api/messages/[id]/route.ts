import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";

// DELETE /api/messages/[id] - Delete message (only owner can delete)
export async function DELETE(
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

    const { id: messageId } = await params;

    // Find message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Správa nebola nájdená" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (message.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Nemáte oprávnenie vymazať túto správu" },
        { status: 403 }
      );
    }

    // Delete message
    await prisma.message.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Chyba pri mazaní správy" },
      { status: 500 }
    );
  }
}
