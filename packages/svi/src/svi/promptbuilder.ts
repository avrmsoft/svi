// src/commands/runner/promptBuilder.ts
import { SVIFile } from "./types";
import { generatorPromptTemplate } from "./prompts/generate";
import { optionValueAsString } from "../utils/utils";
import { SVIImportPrompts } from "./sviImportPrompts";
import { SviConfig } from "../config/config";

/**
 * Build a final prompt text based on a SVI-File.
 * @param svi The parsed SVI file.
 * @returns The final prompt string for the LLM.
 */
export function buildPrompt(svi: SVIFile, config: SviConfig): string {
  const programmingLanguage = optionValueAsString(
    svi.options?.ProgrammingLanguage || config.programmingLanguage || "Node.js",
  );

  const inputParams =
    svi.inputParameters && svi.inputParameters.length > 0
      ? `Input parameters: ${svi.inputParameters.join(", ")}.`
      : "";

  const outputParams =
    svi.output && svi.output.length > 0
      ? `Output parameters: ${svi.output.join(", ")}.`
      : "";

  if (!svi.prompt) {
    throw new Error("SVI file is missing the main prompt section.");
  }

  // Prompt from #Prompt section
  const mainPrompt = svi.prompt || "";

  // Import Prompts
  const importPrompter = new SVIImportPrompts(svi);
  if (!importPrompter.loadImportedPrompts()) {
    return "";
  }
  const importedPrompts = importPrompter.getImportedPromptsAsString();

  // Build the final prompt
  let finalPrompt = generatorPromptTemplate
    .replace("{{programmingLanguage}}", programmingLanguage)
    .replace("{{inputParameters}}", inputParams)
    .replace("{{outputParameters}}", outputParams)
    .replace("{{mainPrompt}}", mainPrompt)
    .replace("{{importedPrompts}}", importedPrompts);

  return finalPrompt.trim();
}
