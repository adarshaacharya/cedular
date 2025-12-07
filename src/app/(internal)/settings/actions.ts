"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function updateUserPreferences(formData: FormData) {
  const userId = formData.get("userId") as string;
  const timezone = formData.get("timezone") as string;
  const workingHoursStart = formData.get("workingHoursStart") as string;
  const workingHoursEnd = formData.get("workingHoursEnd") as string;
  const calendarId = formData.get("calendarId") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        calendarId: calendarId || null,
      },
      update: {
        calendarId: calendarId || null,
      },
    });

    revalidatePath("/settings");
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw new Error("Failed to update preferences");
  }
}

export async function connectGmail(userId: string) {
  // Redirect to existing Google OAuth flow
  redirect("/api/auth/google");
}

export async function disconnectGmail(formData: FormData) {
  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    await prisma.userPreferences.update({
      where: { userId },
      data: {
        gmailAccessToken: null,
        gmailRefreshToken: null,
        gmailTokenExpiry: null,
        assistantEmail: null,
      },
    });

    revalidatePath("/settings");
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    throw new Error("Failed to disconnect Gmail");
  }
}

export async function connectCalendar(userId: string) {
  // Redirect to existing Google OAuth flow (handles both Gmail and Calendar)
  redirect("/api/auth/google");
}

export async function disconnectCalendar(formData: FormData) {
  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    await prisma.userPreferences.update({
      where: { userId },
      data: {
        calendarAccessToken: null,
        calendarRefreshToken: null,
        calendarTokenExpiry: null,
        calendarId: null,
      },
    });

    revalidatePath("/settings");
  } catch (error) {
    console.error("Error disconnecting calendar:", error);
    throw new Error("Failed to disconnect calendar");
  }
}
