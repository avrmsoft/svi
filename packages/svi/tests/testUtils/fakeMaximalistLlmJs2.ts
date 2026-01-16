/*
import { vi } from "vitest";
import LLM from "@themaximalist/llm.js";

export interface RequiredLLMOptions {
  model?: string;
  apiKey?: string;
  service?: string;
}

let sendSpy: any;

export function enableFakeMaximalistLLMJsLLM(
  requiredOptions: RequiredLLMOptions
) {
  sendSpy = vi
    // ⬇️ TypeScript ruhigstellen, Runtime ist korrekt
    .spyOn(LLM.prototype, "send")
    //.spyOn(LLM as any, "send")
    .mockImplementation(async function () {
      const llm = this as any;

      // 1️⃣ Optionen prüfen
      if (requiredOptions.model && llm.model !== requiredOptions.model) {
        throw new Error(
          `Expected model=${requiredOptions.model}, got ${llm.model}`
        );
      }

      if (requiredOptions.apiKey && llm.apiKey !== requiredOptions.apiKey) {
        throw new Error(
          `Expected apiKey=${requiredOptions.apiKey}, got ${llm.apiKey}`
        );
      }

      if (!llm.service) {
        throw new Error("Expected service to be defined and not empty");
      }

      // 2️⃣ Prompts korrekt aus messages lesen
      const systemPrompt = llm.messages.find(
        (m: any) => m.role === "system"
      )?.content;

      const userPrompt = llm.messages.find(
        (m: any) => m.role === "user"
      )?.content;

      // 3️⃣ Fake-Antwort
      return `Fake LLM answer for system prompt = ${systemPrompt}, user prompt = ${userPrompt}`;
    });
}

export function disableFakeMaximalistLLMJsLLM() {
  if (sendSpy) {
    sendSpy.mockRestore();
  }
}
*/
