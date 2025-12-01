import { HandlerInput, HandlerOutput } from "./types";

export async function handleInfoRequest(
  input: HandlerInput
): Promise<HandlerOutput> {
  // PLAN:
  // 1. Use the response generator to craft a helpful reply
  // 2. Provide general availability info (e.g., "I'm generally available 9-5 on weekdays")
  // 3. Suggest they send a scheduling request if they want to book time
  // 4. Send the response email

//   or;
  //  // 1. Mark the thread as needing human attention
  // 2. Optionally notify the user (owner) about the inquiry
  // 3. Don't auto-respond
  console.log(`[Workflow] Skipping info_request email`);
  return {
    success: true,
    threadId: input.emailThread.threadId,
  };
}
