import { z } from "zod";

export const calendarAgentInputSchema = z.object({
  participants: z.array(z.string().email()),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  preferences: z
    .object({
      timezone: z.string().default("UTC"),
      workingHoursStart: z.string().default("09:00"),
      workingHoursEnd: z.string().default("17:00"),
      preferredTimes: z.array(z.string()).optional(), // e.g., ["09:00-11:00", "14:00-16:00"]
      avoidTimes: z.array(z.string()).optional(), // e.g., ["12:00-13:00"]
      bufferMinutes: z.number().default(15),
    })
    .optional(),
});

export const timeSlotSchema = z
  .object({
    start: z
      .string()
      .describe("Full ISO 8601 datetime string (e.g., 2025-12-02T09:00:00)"),
    end: z
      .string()
      .describe("Full ISO 8601 datetime string (e.g., 2025-12-02T09:30:00)"),
    score: z.number().min(0).max(100),
    reason: z.string().describe("The reason for the score"),
  })
  .describe("A time slot with a score and reason");

export const calendarAgentOutputSchema = z
  .object({
    slots: z.array(timeSlotSchema).min(1).max(5),
  })
  .describe("The optimal time slots for the meeting");

export type CalendarAgentInput = z.infer<typeof calendarAgentInputSchema>;
export type CalendarAgentOutput = z.infer<typeof calendarAgentOutputSchema>;
export type TimeSlot = z.infer<typeof timeSlotSchema>;
