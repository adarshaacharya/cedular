import { evalite } from "evalite";
import { parseEmail } from "./index";

interface EmailParseResult {
  intent: string;
  participants: string[];
  duration?: number;
  title: string;
  context: string;
  urgency: string;
}

interface TestCase {
  input: { subject: string; body: string };
  expected: { intent: string; duration?: number; urgency: string };
}

const emailTestCases: TestCase[] = [
  {
    input: {
      subject: "Meeting request",
      body: "Can we schedule a 30 min meeting next Tuesday?",
    },
    expected: { intent: "schedule", duration: 30, urgency: "medium" },
  },
  {
    input: {
      subject: "Need to reschedule",
      body: "Can we move our 2pm call to 10am tomorrow?",
    },
    expected: { intent: "reschedule", urgency: "medium" },
  },
  {
    input: {
      subject: "Cancel meeting",
      body: "Please cancel tomorrow's 11am meeting",
    },
    expected: { intent: "cancel", urgency: "high" },
  },
  {
    input: {
      subject: "When is our meeting?",
      body: "When is our next sync scheduled?",
    },
    expected: { intent: "info_request", urgency: "low" },
  },
];

evalite("Email Parser Core Functionality", {
  data: emailTestCases,
  task: async (input): Promise<EmailParseResult> => {
    return await parseEmail({
      emailBody: input.body,
      subject: input.subject,
      userId: "test-user",
    });
  },
  scorers: [
    // Simple exact match for intent
    ({
      output,
      expected,
    }: {
      output: EmailParseResult;
      expected: TestCase["expected"];
    }) => ({
      score: output.intent === expected.intent ? 100 : 0,
      name: "Intent Match",
    }),
    // Duration accuracy with tolerance
    ({
      output,
      expected,
    }: {
      output: EmailParseResult;
      expected: TestCase["expected"];
    }) => {
      if (!expected.duration) return { score: 100, name: "Duration N/A" };
      const diff = Math.abs((output.duration || 0) - expected.duration);
      return {
        score: diff <= 5 ? 100 : Math.max(0, 100 - diff * 10),
        name: "Duration Match",
      };
    },
    // Urgency classification
    ({
      output,
      expected,
    }: {
      output: EmailParseResult;
      expected: TestCase["expected"];
    }) => ({
      score: output.urgency === expected.urgency ? 100 : 0,
      name: "Urgency Match",
    }),
  ],
});
