/**
 * Calendar Agent Evaluation Tests
 *
 * Tests the calendar agent's ability to find optimal meeting time slots
 *
 * Note: This eval uses mock calendar data for testing without requiring
 * real OAuth credentials. A test user is created with mock tokens.
 */

import { evalite } from "evalite";
import { runCalendarAgent } from "./index";
import type { CalendarAgentInput, CalendarAgentOutput } from "./types";
import { setupTestUser } from "./_lib/test-setup";
import { getMockCalendarEvents } from "./_lib/mock-calendar";

// Mock the calendar integration
import * as calendarIntegration from "@/integrations/calendar";

// Create a wrapper that uses mock data during evals
async function getCalendarEventsWrapper(
  params: Parameters<typeof calendarIntegration.getCalendarEvents>[0]
) {
  return getMockCalendarEvents(params);
}

// Replace the function in the module
Object.defineProperty(calendarIntegration, "getCalendarEvents", {
  value: getCalendarEventsWrapper,
  writable: false,
});

interface TestCase {
  input: CalendarAgentInput;
  expected: {
    slotsCount: number;
    minScore: number; // Minimum score any slot should have
  };
}

const calendarTestCases: TestCase[] = [
  {
    input: {
      participants: ["alice@example.com", "bob@example.com"],
      duration: 30,
      preferences: {
        timezone: "UTC",
        workingHoursStart: "09:00",
        workingHoursEnd: "17:00",
        bufferMinutes: 15,
      },
    },
    expected: {
      slotsCount: 3,
      minScore: 50,
    },
  },
  {
    input: {
      participants: [
        "alice@example.com",
        "bob@example.com",
        "charlie@example.com",
      ],
      duration: 60,
      preferences: {
        timezone: "America/New_York",
        workingHoursStart: "09:00",
        workingHoursEnd: "18:00",
        preferredTimes: ["09:00-11:00", "14:00-16:00"],
        bufferMinutes: 30,
      },
    },
    expected: {
      slotsCount: 3,
      minScore: 50,
    },
  },
  {
    input: {
      participants: ["alice@example.com", "bob@example.com"],
      duration: 90,
      preferences: {
        timezone: "Europe/London",
        workingHoursStart: "08:30",
        workingHoursEnd: "17:30",
        avoidTimes: ["12:00-13:00"], // Avoid lunch
        bufferMinutes: 15,
      },
    },
    expected: {
      slotsCount: 3,
      minScore: 50,
    },
  },
];

let testUserId: string;

evalite("Calendar Agent - Time Slot Finding", {
  data: calendarTestCases,
  task: async (input): Promise<CalendarAgentOutput> => {
    // Set up test user on first run
    if (!testUserId) {
      testUserId = await setupTestUser();
    }

    // Run the calendar agent with test user
    return await runCalendarAgent(input, testUserId);
  },
  scorers: [
    // Check correct number of slots returned
    ({
      output,
      expected,
    }: {
      output: CalendarAgentOutput;
      expected: TestCase["expected"];
    }) => ({
      score:
        output.slots.length === expected.slotsCount
          ? 100
          : Math.max(
              0,
              100 - Math.abs(output.slots.length - expected.slotsCount) * 20
            ),
      name: "Slot Count Accuracy",
    }),

    // Check minimum score threshold
    ({
      output,
      expected,
    }: {
      output: CalendarAgentOutput;
      expected: TestCase["expected"];
    }) => {
      const minSlotScore = Math.min(...output.slots.map((slot) => slot.score));
      return {
        score:
          minSlotScore >= expected.minScore
            ? 100
            : Math.max(0, (minSlotScore / expected.minScore) * 100),
        name: "Minimum Quality Score",
      };
    },

    // Check slots are ordered by score (descending)
    ({ output }: { output: CalendarAgentOutput }) => {
      const isOrdered = output.slots.every(
        (slot, i) => i === 0 || slot.score <= output.slots[i - 1].score
      );
      return {
        score: isOrdered ? 100 : 0,
        name: "Slots Properly Ordered",
      };
    },

    // Check all slots have valid start/end times
    ({ output }: { output: CalendarAgentOutput }) => {
      const allValid = output.slots.every((slot) => {
        try {
          const start = new Date(slot.start);
          const end = new Date(slot.end);
          return (
            start < end && !isNaN(start.getTime()) && !isNaN(end.getTime())
          );
        } catch {
          return false;
        }
      });
      return {
        score: allValid ? 100 : 0,
        name: "Valid Time Formats",
      };
    },

    // Check all slots have reasons
    ({ output }: { output: CalendarAgentOutput }) => {
      const allHaveReasons = output.slots.every(
        (slot) => slot.reason && slot.reason.length > 0
      );
      return {
        score: allHaveReasons ? 100 : 50,
        name: "Reasoning Provided",
      };
    },
  ],
});
