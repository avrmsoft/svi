import ModelUsageWrapper from "../../../src/llm/theMaximalistLlmJs/ModelUsageWrapper";
import { vi } from "vitest";
import { ModelUsageType } from "@themaximalist/llm.js";
import { ModelUsage } from "@themaximalist/llm.js";

const SERVICE_MODEL_MAPPING = [
  { model: "gemini-2.5-flash", service: "gemini" },
];

export function enableFakeMaximalistLLMJsModelUsage() {
  vi.spyOn(ModelUsageWrapper, "getAll").mockImplementation(() => {
    return SERVICE_MODEL_MAPPING.map((item) => ({
      model: item.model,
      service: item.service,
    })) as unknown as ModelUsageType[];
  });

  vi.spyOn(ModelUsageWrapper, "refresh").mockImplementation(async () => {
    return SERVICE_MODEL_MAPPING.map((item) => ({
      model: item.model,
      service: item.service,
    })) as unknown as ModelUsageType[];
  });
}

export function disableFakeMaximalistLLMJsModelUsage() {
  vi.restoreAllMocks();
}
