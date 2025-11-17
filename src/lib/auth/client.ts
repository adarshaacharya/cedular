import { env } from "@/env";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [nextCookies()],
});
