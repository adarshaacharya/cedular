import { z } from "zod";
import { getTimeZones } from "@vvo/tzdb";

// Get all valid timezone names for validation
const validTimezones = getTimeZones().map((tz) => tz.name);

export const userPreferencesSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .refine((tz) => validTimezones.includes(tz), {
      message: "Please select a valid timezone",
    }),
  workingHoursStart: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  workingHoursEnd: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  bufferMinutes: z
    .number()
    .int()
    .min(0, "Buffer must be at least 0 minutes")
    .max(720, "Buffer cannot exceed 720 minutes (12 hours)"),
  calendarId: z.string().optional(),
  assistantEmail: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
});

export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;
