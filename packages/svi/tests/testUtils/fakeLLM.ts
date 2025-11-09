// Please create fake implementation for LLMProcessor class

import { vi } from "vitest";
import { LLMProcessor } from "../../src/llm/llm";

let spy: any;

export function enableFakeLLMProcessor() {
  //spy = vi.spyOn(LLMProcessor.prototype, "ask").mockResolvedValue("Fake LLM answer");
  spy = vi.spyOn(LLMProcessor.prototype, "ask").mockImplementation(async (prompt: string, systemPrompt?: string): Promise<string> => {
    // You can customize the fake response based on the prompt if needed
    return `Fake LLM answer for system prompt = ${systemPrompt}, user prompt = ${prompt}`;
  });
}

export function disableFakeLLMProcessor() {
  if (spy) {
    spy.mockRestore();
  }
}