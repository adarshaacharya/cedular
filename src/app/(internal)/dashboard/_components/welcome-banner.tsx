import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

export async function WelcomeBanner() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Welcome back, {session?.user?.name || session?.user?.email || "User"}!
      </h1>
      <p className="text-muted-foreground">
        Here&apos;s what&apos;s happening with your scheduling.
      </p>
    </div>
  );
}
