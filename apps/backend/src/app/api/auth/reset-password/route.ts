import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token je povinný" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Heslo musí mať minimálne 8 znakov" },
        { status: 400 }
      );
    }

    // Find reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Neplatný alebo expirovaný token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetRecord.expiresAt < new Date()) {
      // Delete expired token
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id },
      });
      return NextResponse.json(
        { error: "Token expiroval. Požiadaj o nový reset link." },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (resetRecord.used) {
      return NextResponse.json(
        { error: "Token bol už použitý" },
        { status: 400 }
      );
    }

    // Hash password using scrypt (same as Better Auth)
    // Better Auth uses scrypt from @noble/hashes with these exact parameters:
    // N: 16384, r: 16, p: 1, dkLen: 64
    // Format: salt:key (both hex-encoded)
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(
      password.normalize("NFKC"), // Better Auth normalizes password
      salt,
      64, // dkLen
      {
        N: 16384,
        r: 16,
        p: 1,
        maxmem: 128 * 16384 * 16 * 2, // 128 * N * r * 2
      }
    )) as Buffer;
    const hashedPassword = `${salt}:${derivedKey.toString("hex")}`;

    // Update user password in Account table
    await prisma.account.updateMany({
      where: {
        userId: resetRecord.userId,
        providerId: "credential",
      },
      data: {
        password: hashedPassword,
      },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    // Delete all sessions for this user (force re-login)
    await prisma.session.deleteMany({
      where: { userId: resetRecord.userId },
    });

    return NextResponse.json({
      message: "Heslo bolo úspešne zmenené. Môžeš sa prihlásiť.",
    });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return NextResponse.json(
      { error: "Nastala chyba. Skús to znova." },
      { status: 500 }
    );
  }
}
