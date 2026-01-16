/*import { vi } from "vitest";

const SERVICE_MODEL_MAPPING = [
  { model: "gemini-2.5-flash", service: "gemini" },
];*/

/*
import { ModelUsage } from "@themaximalist/llm.js";
import logger from "../utils/logger";

export class LLMServiceByModel {
  static async getServiceForModel(model: string): Promise<string | null> {
    // Get all cached models
    const allModels = ModelUsage.getAll();

    // Try to find model in cached data
    const foundModel = allModels.find((m) => m.model === model);

    let result;

    if (foundModel) {
      result = this.adjustServiceName(foundModel.service);
      return result;
    }

    // If not found, refresh from latest sources
    const refreshedModels = await ModelUsage.refresh();
    //console.log("Refreshed models:", refreshedModels.length);
    logger.info(`Refreshed models: ${refreshedModels.length}`);

    // Try to find again in refreshed list
    const updatedModel = refreshedModels.find((m) => m.model === model);

    result = updatedModel ? updatedModel.service : null;
    result = this.adjustServiceName(result);
    return result;
  }

  private static adjustServiceName(service: string | null): string | null {
    switch (service) {
      case "gemini":
        return "google";
      default:
        return service;
    }
  }
}
*/

/*export function enableFakeMaximalistLLMJsLLM(requiredOptions: {
  model?: string;
  apiKey?: string;
  service?: string;
}) {
  vi.mock("@themaximalist/llm.js", () => {
    //vi.mock(import("@themaximalist/llm.js"), () => {
    return {
      default: vi.fn().mockImplementation((options = {}) => {
        return {
          options,
          model: options.model,
          service: options.service,
          messages: [],

          system(content: string) {
            this.messages.push({ role: "system", content });
          },

          user(content: string) {
            this.messages.push({ role: "user", content });
          },

          addMessage(role: string, content: any) {
            this.messages.push({ role, content });
          },

          async send() {
            if (options.model !== "test-model") {
              throw new Error(
                `Expected model=test-model, got ${options.model}`
              );
            }

            if (options.apiKey !== "test-key") {
              throw new Error(
                `Expected apiKey=test-key, got ${options.apiKey}`
              );
            }

            if (!options.service) {
              throw new Error("Expected service to be defined and not empty");
            }

            const systemPrompt = this.messages.find(
              (m: any) => m.role === "system"
            )?.content;

            const userPrompt = this.messages.find(
              (m: any) => m.role === "user"
            )?.content;

            return `Fake LLM answer for system prompt = ${systemPrompt}, user prompt = ${userPrompt}`;
          },
        };
      }),
      ModelUsage: vi.fn().mockImplementation(() => {
        return {
          static: {
            getAll: () => SERVICE_MODEL_MAPPING,
            refresh: async () => SERVICE_MODEL_MAPPING,
          },
        };
      }),
    };
  });
}
//import LLM from "@themaximalist/llm.js";

export function disableFakeMaximalistLLMJsLLM() {
  vi.unmock("@themaximalist/llm.js");
}
*/
