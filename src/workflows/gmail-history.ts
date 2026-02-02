import type {
  HistoryProcessorInput,
  HistoryProcessorResult,
} from "@/workflows/email-processor";
import { processEmailFromHistory } from "@/workflows/email-processor";

export async function handleGmailHistory(
  input: HistoryProcessorInput
): Promise<HistoryProcessorResult> {
  "use workflow";
  return await processHistoryStep(input);
}

async function processHistoryStep(
  input: HistoryProcessorInput
): Promise<HistoryProcessorResult> {
  "use step";
  return await processEmailFromHistory(input);
}
