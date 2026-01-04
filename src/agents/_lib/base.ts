import { z } from "zod";
import prisma from "../../lib/prisma";
import { Output, ToolLoopAgent } from "ai";
import type { ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";

export const DEFAULT_MODEL = openai("gpt-4o");

/**
 * Run an agent with structured output (for parsing/extraction tasks)
 * Use this for simple extraction/parsing where you just need structured JSON output
 */
export async function runStructuredAgent<T extends z.ZodType>({
  agentName,
  instructions,
  prompt,
  schema,
  userId,
}: {
  agentName: string;
  instructions: string;
  prompt: string;
  schema: T;
  userId: string;
}): Promise<z.infer<T>> {
  const startTime = Date.now();

  try {
    console.log(`[Agent: ${agentName}] Starting...`);

    const agent = new ToolLoopAgent({
      model: DEFAULT_MODEL,
      instructions,
      output: Output.object({
        schema,
      }),
      experimental_telemetry: { isEnabled: true },
    });

    const result = await agent.generate({
      prompt,
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    const tokensUsed = result.usage?.totalTokens;

    await logAgentRun({
      agentName,
      input: { instructions, prompt },
      output: result.output as z.infer<T>,
      latencyMs,
      tokensUsed: tokensUsed || null,
      userId,
      model: "gpt-4o-mini",
    });

    return result.output as z.infer<T>;
  } catch (error) {
    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    console.error(`[Agent: ${agentName}] Error:`, error);

    await logAgentRun<{ error: string }>({
      agentName,
      input: { instructions, prompt },
      output: {
        error: error instanceof Error ? error.message : String(error),
      },
      latencyMs,
      tokensUsed: null,
      userId,
      model: "gpt-4o-mini",
    });

    throw error;
  }
}

/**
 * Create and run a ToolLoopAgent (AI SDK 6)
 * Use this for agents that need to autonomously call tools
 * The agent will automatically loop through tool calls until completion (up to 20 steps)
 */
export async function runToolLoopAgent({
  agentName,
  instructions,
  prompt,
  tools,
  userId,
  model = DEFAULT_MODEL,
  output,
}: {
  agentName: string;
  instructions: string;
  prompt: string;
  tools: ToolSet;
  userId: string;
  model?: ReturnType<typeof openai>;
  output?: ReturnType<typeof Output.object>;
}) {
  const startTime = Date.now();

  try {
    console.log(`[Agent: ${agentName}] Starting...`);

    // Create the ToolLoopAgent
    const agent = new ToolLoopAgent({
      model,
      instructions,
      tools,
      output,
      experimental_telemetry: { isEnabled: true },
      // Automatically loops up to 20 steps by default
    });

    // Generate with the agent
    const result = await agent.generate({
      prompt,
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    const tokensUsed = result.usage?.totalTokens;

    console.log(
      `[Agent: ${agentName}] Completed in ${latencyMs}ms, tokens: ${
        tokensUsed || "N/A"
      }`
    );

    await logAgentRun({
      agentName,
      input: { instructions, prompt },
      output: {
        text: result.text,
        toolCalls: result.steps?.flatMap((s) => s.toolCalls || []),
        toolResults: result.steps?.flatMap((s) => s.toolResults || []),
      },
      latencyMs,
      tokensUsed: tokensUsed || null,
      userId,
      model: typeof model === "string" ? model : "gpt-4o-mini",
    });

    return result;
  } catch (error) {
    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    console.error(`[Agent: ${agentName}] Error:`, error);
    if (error instanceof Error) {
      console.error(`[Agent: ${agentName}] Error message:`, error.message);
      console.error(`[Agent: ${agentName}] Error stack:`, error.stack);
    }

    await logAgentRun<{ error: string }>({
      agentName,
      input: { instructions, prompt },
      output: {
        error: error instanceof Error ? error.message : String(error),
      },
      latencyMs,
      tokensUsed: null,
      userId,
      model: typeof model === "string" ? model : "gpt-4o-mini",
    });

    throw error;
  }
}

async function logAgentRun<T>({
  agentName,
  input,
  output,
  latencyMs,
  tokensUsed,
  userId,
  model,
}: {
  agentName: string;
  input: string | object;
  output: T;
  latencyMs: number;
  tokensUsed: number | null;
  userId: string;
  model: string;
}) {
  try {
    await prisma.agentLog.create({
      data: {
        agentName,
        model: model || null,
        input: typeof input === "string" ? { prompt: input } : input,
        output: output as object,
        latencyMs,
        tokensUsed: tokensUsed || null,
        userId,
      },
    });
  } catch (error) {
    console.error("Failed to log agent run:", error);
  }
}
