"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    } else if (session?.user?.id) {
      // Redirect to /users/[id] with current user's ID
      router.push(`/users/${session.user.id}`);
    }
  }, [session, isPending, router]);

  // Show loading while redirecting
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-300">Načítavam profil...</p>
      </div>
    </main>
  );
}
