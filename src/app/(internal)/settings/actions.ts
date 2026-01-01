"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { userPreferencesSchema } from "./schema";

export async function getUserPreferences(userId: string) {
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId },
  });

  return preferences;
}

export async function getUserScheduleProfile(userId: string) {
  const profile = await prisma.userScheduleProfile.findUnique({
    where: { userId },
  });

  return profile;
}

export async function updateUserPreferences(formData: FormData) {
  const bufferMinutesValue = formData.get("bufferMinutes") as string;
  const rawData = {
    userId: formData.get("userId") as string,
    timezone: formData.get("timezone") as string,
    workingHoursStart: formData.get("workingHoursStart") as string,
    workingHoursEnd: formData.get("workingHoursEnd") as string,
    bufferMinutes: bufferMinutesValue ? parseInt(bufferMinutesValue) : 15, // Default to 15 if empty
    calendarId: formData.get("calendarId") as string,
    assistantEmail: formData.get("assistantEmail") as string,
  };

  // Validate with Zod schema
  const validationResult = userPreferencesSchema.safeParse(rawData);

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((e) => e.message)
      .join(", ");
    throw new Error(errors);
  }

  const data = validationResult.data;

  // Additional validation for working hours
  if (data.workingHoursStart >= data.workingHoursEnd) {
    throw new Error("Working hours start must be before working hours end");
  }

  try {
    // Update userPreferences (OAuth/account level settings)
    await prisma.userPreferences.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        calendarId: data.calendarId || null,
        assistantEmail: data.assistantEmail || null,
      },
      update: {
        calendarId: data.calendarId || null,
        assistantEmail: data.assistantEmail || null,
      },
    });

    // Upsert userScheduleProfile (scheduling settings)
    await prisma.userScheduleProfile.upsert({
      where: { userId: data.userId },
      create: {
        userId: data.userId,
        timezone: data.timezone,
        workingHoursStart: data.workingHoursStart,
        workingHoursEnd: data.workingHoursEnd,
        bufferMinutes: data.bufferMinutes,
      },
      update: {
        timezone: data.timezone,
        workingHoursStart: data.workingHoursStart,
        workingHoursEnd: data.workingHoursEnd,
        bufferMinutes: data.bufferMinutes,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw new Error("Failed to update preferences");
  }
}

export async function connectGoogleServices() {
  // Redirect to Google OAuth flow (handles both Gmail and Calendar)
  redirect("/api/auth/google");
}

export async function disconnectGoogleServices(formData: FormData) {
  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Clear all Google service tokens and data
    await prisma.userPreferences.update({
      where: { userId },
      data: {
        // Clear all Google service tokens and data
        gmailAccessToken: null,
        gmailRefreshToken: null,
        gmailTokenExpiry: null,
        calendarAccessToken: null,
        calendarRefreshToken: null,
        calendarTokenExpiry: null,
        assistantEmail: null,
        calendarId: null,
      },
    });

    revalidatePath("/settings");
  } catch (error) {
    console.error("Error disconnecting Google services:", error);
    throw new Error("Failed to disconnect Google services");
  }
}
