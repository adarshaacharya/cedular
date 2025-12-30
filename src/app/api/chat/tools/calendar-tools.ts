/**
 * Calendar Tools for Chatbot
 *
 * Factory function that creates AI SDK tools with userId baked in.
 * These tools wrap existing calendar integration functions.
 * TODO: findFreeSlots and scoreTimeSlot tools
 */

import { tool } from "ai";
import { z } from "zod";
import {
  getCalendarEvents,
  getUserCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent,
  type CreateEventInput,
} from "@/integrations/calendar";
import { createMeetingFromCalendarEvent } from "@/services/meetings-service";
import { MeetingSource } from "@/prisma/generated/prisma/enums";

const attendeeSchema = z.object({
  email: z.string().email(),
  displayName: z.string().optional(),
});

/**
 * Creates calendar tools with userId already bound.
 * This is the recommended pattern - userId is captured in closure,
 * not exposed in the schema (AI doesn't need to know about it).
 */
export function createCalendarTools(userId: string) {
  return {
    /**
     * Get user's calendar events
     * Read-only - no approval needed
     */
    getUserCalendarEvents: tool({
      description:
        "Get all events from the user's calendar within a specified time range. Use this to check availability or see existing events. After receiving the results, always summarize the events in a user-friendly format, listing event titles, dates, times, and locations. Never show raw JSON data to the user.",
      inputSchema: z.object({
        daysAhead: z
          .number()
          .default(7)
          .describe("Number of days to look ahead from today"),
      }),
      execute: async ({ daysAhead }: { daysAhead: number }) => {
        try {
          console.log(
            `[Calendar] Getting user calendar events for user ${userId}`
          );
          const timeMin = new Date();
          const timeMax = new Date(
            Date.now() + daysAhead * 24 * 60 * 60 * 1000
          );

          const result = await getUserCalendarEvents(userId, timeMin, timeMax);
          console.log(
            `[Calendar] Found ${result.items.length} events in user ${userId}'s calendar`
          );
          return {
            success: true,
            events: result.items,
            count: result.items.length,
            timeRange: {
              from: timeMin.toISOString(),
              to: timeMax.toISOString(),
            },
            message: `Found ${result.items.length} events in your calendar`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch calendar events",
          };
        }
      },
    }),

    /**
     * Get calendar events for a specific attendee
     * Read-only - no approval needed
     */
    getCalendarEvents: tool({
      description:
        "Get calendar events for a specific attendee email within a time range. Use this to check availability of meeting participants. After receiving the results, summarize the attendee's schedule in a clear, readable format. Never show raw JSON data to the user.",
      inputSchema: z.object({
        attendeeEmail: z
          .string()
          .email()
          .describe("Email address of the attendee to check"),
        daysAhead: z
          .number()
          .default(7)
          .describe("Number of days to look ahead from today"),
      }),
      execute: async ({
        attendeeEmail,
        daysAhead,
      }: {
        attendeeEmail: string;
        daysAhead: number;
      }) => {
        try {
          console.log(
            `[Calendar] Getting calendar events for attendee ${attendeeEmail} for user ${userId}`
          );
          const timeMin = new Date();
          const timeMax = new Date(
            Date.now() + daysAhead * 24 * 60 * 60 * 1000
          );

          const events = await getCalendarEvents({
            attendeeEmail,
            userId,
            timeMin,
            timeMax,
          });

          console.log(
            `[Calendar] Found ${events.length} events for attendee ${attendeeEmail} for user ${userId}`
          );
          return {
            success: true,
            attendee: attendeeEmail,
            events,
            count: events.length,
            timeRange: {
              from: timeMin.toISOString(),
              to: timeMax.toISOString(),
            },
            message: `Found ${events.length} events for ${attendeeEmail}`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch attendee events",
          };
        }
      },
    }),

    /**
     * Get a specific calendar event by ID
     * Read-only - no approval needed
     */
    getCalendarEvent: tool({
      description:
        "Get details of a specific calendar event by its ID. Use this when you need to see full details of a particular event. After receiving the result, present the event details in a natural, user-friendly format with all relevant information clearly organized. Never show raw JSON data to the user.",
      inputSchema: z.object({
        eventId: z.string().describe("The ID of the event to retrieve"),
      }),
      execute: async ({ eventId }: { eventId: string }) => {
        try {
          console.log(`[Calendar] Getting event ${eventId} for user ${userId}`);
          const event = await getCalendarEvent(eventId, userId);

          console.log(
            `[Calendar] Found event ${event.summary} for user ${userId}`
          );
          return {
            success: true,
            event,
            message: `Retrieved event "${event.summary}"`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch event details",
          };
        }
      },
    }),

    /**
     * Create a calendar event
     * Destructive - requires user approval
     */
    createCalendarEvent: tool({
      description:
        "Create a new calendar event. This will send invitations to all attendees. Use this when the user wants to schedule a meeting or event. After creating the event, confirm the creation with a friendly message including the event title, date, time, and any meeting links. Never show raw JSON data to the user.",
      inputSchema: z.object({
        summary: z.string().min(1).describe("Title of the event"),
        description: z.string().optional().describe("Description of the event"),
        startDateTime: z
          .string()
          .describe(
            "Start time in ISO 8601 format (e.g., '2024-01-15T10:00:00')"
          ),
        endDateTime: z
          .string()
          .describe(
            "End time in ISO 8601 format (e.g., '2024-01-15T11:00:00')"
          ),
        timeZone: z.string().default("UTC").describe("Time zone for the event"),
        attendees: z
          .array(attendeeSchema)
          .optional()
          .describe("List of attendees to invite"),
        location: z.string().optional().describe("Location of the event"),
        addConference: z
          .boolean()
          .default(false)
          .describe("Whether to add Google Meet conference"),
      }),
      execute: async (input: {
        summary: string;
        description?: string;
        startDateTime: string;
        endDateTime: string;
        timeZone: string;
        attendees?: Array<{ email: string; displayName?: string }>;
        location?: string;
        addConference: boolean;
      }) => {
        try {
          console.log(
            `[Calendar] Creating event ${input.summary} for user ${userId}`
          );
          const eventData: CreateEventInput = {
            summary: input.summary,
            description: input.description,
            start: {
              dateTime: input.startDateTime,
              timeZone: input.timeZone,
            },
            end: {
              dateTime: input.endDateTime,
              timeZone: input.timeZone,
            },
            attendees: input.attendees,
            location: input.location,
            ...(input.addConference && {
              conferenceData: {
                createRequest: {
                  requestId: `meet-${Date.now()}`,
                  conferenceSolutionKey: {
                    type: "hangoutsMeet",
                  },
                },
              },
            }),
          };

          const createdEvent = await createCalendarEvent(eventData, userId);

          // Save to database for dashboard visibility
          const meeting = await createMeetingFromCalendarEvent({
            calendarEvent: createdEvent,
            userId,
            meetingLink:
              createdEvent.conferenceData?.entryPoints?.[0]?.uri || undefined,
            source: MeetingSource.chat_assistant,
          });

          console.log(
            `[Calendar] Event ${createdEvent.summary} has been created successfully for user ${userId}`
          );
          return {
            success: true,
            event: createdEvent,
            meeting,
            message: `Event "${createdEvent.summary}" has been created successfully`,
            calendarLink: createdEvent.htmlLink,
            conferenceLink: createdEvent.conferenceData?.entryPoints?.[0]?.uri,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create calendar event",
          };
        }
      },
    }),

    /**
     * Update a calendar event
     * Destructive - requires user approval
     */
    updateCalendarEvent: tool({
      description:
        "Update an existing calendar event. Use this when the user wants to modify meeting details, time, attendees, etc. After updating, confirm the changes with a clear message summarizing what was updated. Never show raw JSON data to the user.",
      inputSchema: z.object({
        eventId: z.string().describe("The ID of the event to update"),
        summary: z.string().optional().describe("New title for the event"),
        description: z
          .string()
          .optional()
          .describe("New description for the event"),
        startDateTime: z
          .string()
          .optional()
          .describe("New start time in ISO 8601 format"),
        endDateTime: z
          .string()
          .optional()
          .describe("New end time in ISO 8601 format"),
        timeZone: z.string().optional().describe("New time zone for the event"),
        attendees: z
          .array(attendeeSchema)
          .optional()
          .describe("Updated list of attendees"),
        location: z.string().optional().describe("New location for the event"),
      }),
      execute: async (input: {
        eventId: string;
        summary?: string;
        description?: string;
        startDateTime?: string;
        endDateTime?: string;
        timeZone?: string;
        attendees?: Array<{ email: string; displayName?: string }>;
        location?: string;
      }) => {
        try {
          console.log(
            `[Calendar] Updating event ${input.eventId} for user ${userId}`
          );
          // Build updates object with only provided fields
          const updates: Record<string, unknown> = {};

          if (input.summary !== undefined) updates.summary = input.summary;
          if (input.description !== undefined)
            updates.description = input.description;
          if (input.startDateTime !== undefined) {
            updates.start = {
              dateTime: input.startDateTime,
              timeZone: input.timeZone || "UTC",
            };
          }
          if (input.endDateTime !== undefined) {
            updates.end = {
              dateTime: input.endDateTime,
              timeZone: input.timeZone || "UTC",
            };
          }
          if (input.attendees !== undefined)
            updates.attendees = input.attendees;
          if (input.location !== undefined) updates.location = input.location;

          const updatedEvent = await updateCalendarEvent(
            input.eventId,
            updates,
            userId
          );

          console.log(
            `[Calendar] Event ${updatedEvent.summary} has been updated successfully for user ${userId}`
          );
          return {
            success: true,
            event: updatedEvent,
            message: `Event "${updatedEvent.summary}" has been updated successfully`,
            calendarLink: updatedEvent.htmlLink,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update calendar event",
          };
        }
      },
    }),

    /**
     * Delete a calendar event
     * Destructive - requires user approval
     */
    deleteCalendarEvent: tool({
      description:
        "Delete a calendar event. Use this when the user wants to cancel a meeting or remove an event from their calendar. After deletion, confirm with a friendly message indicating which event was deleted. Never show raw JSON data to the user.",
      inputSchema: z.object({
        eventId: z.string().describe("The ID of the event to delete"),
      }),
      execute: async ({ eventId }: { eventId: string }) => {
        try {
          console.log(
            `[Calendar] Deleting event ${eventId} for user ${userId}`
          );
          // Get event details before deleting (for confirmation message)
          const eventToDelete = await getCalendarEvent(eventId, userId);

          await deleteCalendarEvent(eventId, userId);

          console.log(
            `[Calendar] Event ${eventToDelete.summary} has been deleted successfully for user ${userId}`
          );
          return {
            success: true,
            deletedEvent: {
              id: eventId,
              summary: eventToDelete.summary,
              start: eventToDelete.start,
              end: eventToDelete.end,
            },
            message: `Event "${eventToDelete.summary}" has been deleted successfully`,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete calendar event",
          };
        }
      },
    }),
  };
}

// Type for the tools object returned by createCalendarTools
export type CalendarTools = ReturnType<typeof createCalendarTools>;
