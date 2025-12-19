import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the Google account for this user
    const googleAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "google",
      },
    });

    if (!googleAccount) {
      return NextResponse.json(
        { error: "No Google account linked" },
        { status: 404 }
      );
    }

    let accessToken = googleAccount.accessToken;

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired =
      !accessToken ||
      (googleAccount.accessTokenExpiresAt &&
        new Date() >
          new Date(googleAccount.accessTokenExpiresAt.getTime() - 5 * 60 * 1000));

    if (isExpired && googleAccount.refreshToken) {
      console.log("Access token expired, refreshing...");
      try {
        const tokenResponse = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              refresh_token: googleAccount.refreshToken,
              grant_type: "refresh_token",
            }),
          }
        );

        if (tokenResponse.ok) {
          const tokens = await tokenResponse.json();
          accessToken = tokens.access_token;
          
          // Update account in DB with new tokens
          await prisma.account.update({
            where: { id: googleAccount.id },
            data: {
              accessToken: tokens.access_token,
              accessTokenExpiresAt: new Date(
                Date.now() + tokens.expires_in * 1000
              ),
              // Update refresh token if a new one is returned
              ...(tokens.refresh_token
                ? { refreshToken: tokens.refresh_token }
                : {}),
            },
          });
          console.log("Token refreshed successfully");
        } else {
          console.error(
            "Failed to refresh token:",
            await tokenResponse.text()
          );
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }

    // Fetch fresh user info from Google
    if (accessToken) {
      try {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const googleUserInfo = await response.json();
          console.log("Fetched Google user info:", googleUserInfo);
          
          if (googleUserInfo.picture) {
            try {
              // Download the image from Google
              const imageResponse = await fetch(googleUserInfo.picture);
              if (!imageResponse.ok) {
                throw new Error("Failed to download image");
              }

              const imageBuffer = Buffer.from(
                await imageResponse.arrayBuffer()
              );

              // Generate unique filename
              const fileExtension = googleUserInfo.picture.includes(".jpg")
                ? "jpg"
                : "png";
              const fileName = `${session.user.id}-${crypto
                .randomBytes(8)
                .toString("hex")}.${fileExtension}`;
              const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
              const filePath = path.join(uploadsDir, fileName);

              // Ensure uploads directory exists
              await mkdir(uploadsDir, { recursive: true });

              // Save image to disk
              await writeFile(filePath, imageBuffer);

              // Update user with local path
              const localImagePath = `${process.env.BETTER_AUTH_URL}/api/uploads/avatars/${fileName}`;
              await prisma.user.update({
                where: { id: session.user.id },
                data: { image: localImagePath },
              });

              console.log("Image downloaded and saved:", localImagePath);

              return NextResponse.json({
                success: true,
                image: localImagePath,
              });
            } catch (downloadError) {
              console.error("Error downloading/saving image:", downloadError);
              // Fallback: just save the Google URL
              await prisma.user.update({
                where: { id: session.user.id },
                data: { image: googleUserInfo.picture },
              });

              return NextResponse.json({
                success: true,
                image: googleUserInfo.picture,
              });
            }
          } else {
            console.log("No picture found in Google user info");
          }
        } else {
          console.error("Failed to fetch Google user info, status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch Google user info:", error);
      }
    }

    return NextResponse.json(
      { error: "Could not sync image from Google" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error syncing Google image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
