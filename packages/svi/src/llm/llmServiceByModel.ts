//import { ModelUsage } from "@themaximalist/llm.js";
//import { createModelUsage } from "./theMaximalistLlmJs/LlmJsFactories";
import ModelUsageWrapper from "./theMaximalistLlmJs/ModelUsageWrapper";
import logger from "../utils/logger";

export class LLMServiceByModel {
  static async getServiceForModel(model: string): Promise<string | null> {
    // Get all cached models
    //const allModels = ModelUsageWrapper.getAll();
    const allModels = ModelUsageWrapper.getAll();

    // Try to find model in cached data
    const foundModel = allModels.find((m) => m.model === model);

    let result;

    if (foundModel) {
      result = this.adjustServiceName(foundModel.service);
      return result;
    }

    // If not found, refresh from latest sources
    const refreshedModels = await ModelUsageWrapper.refresh();
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
