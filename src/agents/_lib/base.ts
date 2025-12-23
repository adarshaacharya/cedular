import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import prisma from "../../lib/prisma";
import logger from "@/lib/logger";
import { generateText, generateObject, stepCountIs } from "ai";
import type { ToolSet } from "ai";

export const DEFAULT_MODEL = openai("gpt-4o-mini");

/**
 * Run an agent with structured output (for parsing/extraction tasks)
 */
export async function runAgent<T extends z.ZodType>({
  agentName,
  prompt,
  schema,
  userId,
}: {
  agentName: string;
  prompt: string;
  schema: T;
  userId: string;
}): Promise<z.infer<T>> {
  const startTime = Date.now();

  try {
    console.log(`[Agent: ${agentName}] Starting...`);

    const result = await generateObject<T>({
      model: DEFAULT_MODEL,
      schema,
      prompt,
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    const tokensUsed = result.usage?.totalTokens;

    logAgentRun({
      agentName,
      input: prompt,
      output: result.object as z.infer<T>,
      latencyMs,
      tokensUsed: tokensUsed || null,
      userId,
      model: DEFAULT_MODEL.modelId || "gpt-4o",
    }).catch((error) => {
      console.error(`Failed to log agent run for ${agentName}:`, error);
    });

    return result.object as z.infer<T>;
  } catch (error) {
    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    console.error(`[Agent: ${agentName}] Error:`, error);

    logAgentRun<{ error: string }>({
      agentName,
      input: prompt,
      output: {
        error: error instanceof Error ? error.message : String(error),
      },
      latencyMs,
      tokensUsed: null,
      userId,
      model: DEFAULT_MODEL.modelId || "gpt-4o",
    }).catch((logError) => {
      console.error(`Failed to log agent error for ${agentName}:`, logError);
    });

    throw error;
  }
}

/**
 * Run an agent with tool calling
 */
export async function runAgentWithTools({
  agentName,
  prompt,
  userId,
  maxSteps = 5,
  tools,
}: {
  agentName: string;
  prompt: string;
  userId: string;
  maxSteps?: number;
  tools: ToolSet;
}) {
  const startTime = Date.now();

  try {
    console.log(`[Agent: ${agentName}] Starting...`);

    const result = await generateText({
      model: DEFAULT_MODEL,
      prompt,
      tools,
      stopWhen: stepCountIs(maxSteps),
    });

    const endTime = Date.now();
    const latencyMs = endTime - startTime;
    const tokensUsed = result.usage?.totalTokens;

    logAgentRun({
      agentName,
      input: prompt,
      output: {
        text: result.text,
        toolCalls: result.steps?.flatMap((s) => s.toolCalls || []),
        toolResults: result.steps?.flatMap((s) => s.toolResults || []),
      },
      latencyMs,
      tokensUsed: tokensUsed || null,
      userId,
      model: DEFAULT_MODEL.modelId || "gpt-4o",
    }).catch((error) => {
      console.error(`Failed to log agent run for ${agentName}:`, error);
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

    logAgentRun<{ error: string }>({
      agentName,
      input: prompt,
      output: {
        error: error instanceof Error ? error.message : String(error),
      },
      latencyMs,
      tokensUsed: null,
      userId,
      model: DEFAULT_MODEL.modelId || "gpt-4o",
    }).catch((logError) => {
      console.error(`Failed to log agent error for ${agentName}:`, logError);
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
  input: string;
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
        input: { prompt: input },
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
