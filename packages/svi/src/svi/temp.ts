// src/commands/runner/promptBuilder.ts
import { SVIFile } from "./types";
import { generatorPromptTemplate } from "./prompts/generate";
import { optionValueAsString } from "../utils/utils";
import { SVIImportPrompts } from "./sviImportPrompts";
import { SviConfig } from "../config/config";
import SviDependencies from "./sviDependencies";
import { LLMProcessor } from "../llm/llm";

/**
 * Build a final prompt text based on a SVI-File.
 * @param svi The parsed SVI file.
 * @returns The final prompt string for the LLM.
 */
export async function buildPrompt(
  svi: SVIFile,
  config: SviConfig,
  llm: LLMProcessor,
): Promise<string> {
  const programmingLanguage = optionValueAsString(
    svi.options?.ProgrammingLanguage || config.programmingLanguage || "Node.js",
  );

  const outputParams =
    svi.output && svi.output.length > 0
      ? `Output parameters: ${svi.output.join(", ")}.`
      : "";

  if (!svi.prompt) {
    throw new Error("SVI file is missing the main prompt section.");
  }

  // Prompt from #Prompt section
  const mainPrompt = svi.prompt || "";

  // Add the dependencies declarations if any
  let declarationsFromDependencies = "";
  if (svi.dependencies && svi.dependencies.length > 0) {
    const sviDependencies = new SviDependencies(llm, config);
    const loaded = await sviDependencies.loadDependenciesDeclarations(svi);
    if (!loaded) {
      throw new Error(
        `Failed to load dependencies declarations for file ${svi.getSviFileName()}.`,
      );
    }
    declarationsFromDependencies =
      sviDependencies.getDependenciesDeclarationsAsString();
  }

  // Import Prompts
  const importPrompter = new SVIImportPrompts(svi, llm, config);
  if (!(await importPrompter.loadImportedPrompts())) {
    return "";
  }
  const importedPrompts = importPrompter.getImportedPromptsAsString();
  const sviRelativePath = svi.getSviFileRelativePath();
  const destinationRelativePath = svi.getDestinationFileRelativePath() || "";

  // Build the final prompt
  let finalPrompt = generatorPromptTemplate
    .replace("{{programmingLanguage}}", programmingLanguage)
    .replace("{{dependencies}}", declarationsFromDependencies)
    .replace("{{outputParameters}}", outputParams)
    .replace("{{mainPrompt}}", mainPrompt)
    .replace("{{importedPrompts}}", importedPrompts)
    .replace("{{sviFilePath}}", sviRelativePath)
    .replace("{{destinationFilePath}}", destinationRelativePath);

  return finalPrompt.trim();
}
