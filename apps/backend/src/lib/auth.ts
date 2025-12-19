import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled:
        !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      mapProfileToUser: (profile) => {
        console.log("Google profile data:", JSON.stringify(profile, null, 2));
        return {
          name:
            profile.name ||
            profile.given_name ||
            profile.displayName ||
            profile.email ||
            "Používateľ",
          email: profile.email,
          emailVerified: !!(profile.email_verified ?? profile.emailVerified),
          image:
            profile.picture ||
            profile.image ||
            profile.avatar_url ||
            profile.avatarUrl ||
            profile.pictureUrl ||
            null,
        };
      },
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
      enabled:
        !!process.env.APPLE_CLIENT_ID && !!process.env.APPLE_CLIENT_SECRET,
    },
  },
  onAPIError: {
    throw: false,
  },
  // Automatic account linking by email
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "apple"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
  trustedOrigins: ["http://localhost:3000"],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  basePath: "/api/auth",
  // Redirect to frontend after errors
  pages: {
    errorPage: process.env.NEXT_PUBLIC_FRONTEND_URL
      ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/auth/signin`
      : "http://localhost:3000/auth/signin",
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
