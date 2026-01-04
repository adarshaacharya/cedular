import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Factuality } from "autoevals";
import { evalite } from "evalite";
import { traceAISDKModel } from "evalite/ai-sdk";

evalite("Calendar AI SDK Tracing Demo", {
  data: [
    {
      input: `What's the best time for a team meeting this week?`,
      expected: `Should suggest specific times and consider team availability`,
    },
    {
      input: `Schedule a 1-hour product demo for next Tuesday at 3pm`,
      expected: `Should create meeting with proper details and confirmation`,
    },
    {
      input: `Do I have any conflicts tomorrow morning?`,
      expected: `Should check calendar and report availability clearly`,
    },
  ],

  task: async (input) => {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `
You are Cedular, an intelligent calendar assistant. You help users manage their time effectively.

Guidelines:
- Always respond in natural, conversational language
- Format calendar information clearly with proper spacing
- Be proactive in suggesting optimal times
- Confirm actions clearly
- Use markdown formatting for better readability

Today's date: ${new Date().toISOString().split("T")[0]}
      `,
      prompt: input,
      experimental_telemetry: { isEnabled: true },
    });

    return await result.text;
  },

  scorers: [Factuality],
});
