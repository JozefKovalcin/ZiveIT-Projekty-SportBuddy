import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email je povinný" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success (security best practice - don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        message:
          "Ak email existuje v našej databáze, poslali sme ti inštrukcie na reset hesla.",
      });
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create password reset record
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Send email
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      resetToken,
      userName: user.name,
    });

    if (!emailResult.success) {
      console.error("Failed to send reset email:", emailResult.error);
      return NextResponse.json(
        { error: "Chyba pri odosielaní emailu. Skús to znova." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Ak email existuje v našej databáze, poslali sme ti inštrukcie na reset hesla.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      { error: "Nastala chyba. Skús to znova." },
      { status: 500 }
    );
  }
}
