import { getServerSession } from "@/lib/get-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

// POST /api/notifications/subscribe - Save push subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = subscriptionSchema.parse(body);

    // Upsert subscription (update if endpoint exists, create if not)
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: session.user.id,
        userAgent: request.headers.get("user-agent") || undefined,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({ success: true, id: subscription.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Neplatné údaje" }, { status: 400 });
    }
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "Chyba pri ukladaní subscription" }, { status: 500 });
  }
}

// DELETE /api/notifications/subscribe - Remove push subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neautorizované" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id, endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json({ error: "Chyba pri mazaní subscription" }, { status: 500 });
  }
}
