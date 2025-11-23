import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import prisma from "../../lib/prisma";

export const DEFAULT_MODEL = openai("gpt-4o-mini");

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

    console.log(
      `[Agent: ${agentName}] Raw result:`,
      JSON.stringify(result.object, null, 2)
    );

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
