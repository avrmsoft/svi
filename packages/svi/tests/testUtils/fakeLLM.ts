import { vi } from "vitest";
import { LLMProcessor } from "../../src/llm/llm";

export interface RequiredLLMOptions {
  modelName?: string;
  service?: string;
  apiKey?: string;
}

let askSpy: any;
let staticSpy: any;

const SERVICE_MODEL_MAPPING = [
  { model: "gemini-2.5-flash", service: "gemini" },
];

export function enableFakeLLMProcessor(requiredOptions?: RequiredLLMOptions) {
  // ✅ Mock für Instanzmethode
  askSpy = vi
    .spyOn(LLMProcessor.prototype, "ask")
    .mockImplementation(async function (
      this: LLMProcessor,
      prompt: string,
      systemPrompt?: string,
    ): Promise<string> {
      if (requiredOptions) {
        const options = this.getOptions() as RequiredLLMOptions;

        if (
          requiredOptions.modelName &&
          options.modelName !== requiredOptions.modelName
        ) {
          throw new Error(
            `Expected modelName to be ${requiredOptions.modelName}, but got ${options.modelName}`,
          );
        }

        if (
          requiredOptions.service &&
          options.service !== requiredOptions.service
        ) {
          throw new Error(
            `Expected service to be ${requiredOptions.service}, but got ${options.service}`,
          );
        }

        if (
          requiredOptions.apiKey &&
          options.apiKey !== requiredOptions.apiKey
        ) {
          throw new Error(
            `Expected apiKey to be ${requiredOptions.apiKey}, but got ${options.apiKey}`,
          );
        }
      }

      return `Fake LLM answer for system prompt = ${systemPrompt}, user prompt = ${prompt}`;
    });

  // ✅ Mock für STATISCHE Methode
  staticSpy = vi
    .spyOn(LLMProcessor, "getServiceForModel")
    .mockImplementation(async (modelName: string): Promise<string | null> => {
      const entry = SERVICE_MODEL_MAPPING.find(
        (item) => item.model === modelName,
      );

      return entry?.service ?? null;
    });
}

export function disableFakeLLMProcessor() {
  if (askSpy) {
    askSpy.mockRestore();
  }
  if (staticSpy) {
    staticSpy.mockRestore();
  }
}
