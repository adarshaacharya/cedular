import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/prisma";
import { env } from "@/env";
import { resend } from "@/lib/email/resend";
import { VerificationEmail } from "@/emails/verification-email";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: user.email,
        subject: "Verify your Cedular account",
        react: VerificationEmail({
          name: user.name,
          verificationUrl: url,
        }),
      });
    },
  },
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  plugins: [nextCookies()], // Required for Next.js server actions - must be last plugin
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.BETTER_AUTH_GOOGLE_REDIRECT_URI,
    },
  },
});
