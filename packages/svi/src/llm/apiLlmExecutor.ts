import { Options } from "@themaximalist/llm.js";

import logger from "../utils/logger";
import { UNLIMITED_TOKENS } from "../utils/constants";

import { prepareApiKeyForLogs } from "./llmUtils";
import { LLMServiceByModel } from "./llmServiceByModel";
import LlmJsFactories from "./theMaximalistLlmJs/LlmJsFactories";

import { LLMExecutor, LLMOptions } from "./types";

export default class ApiLLMExecutor implements LLMExecutor {
  constructor(private readonly options: LLMOptions) {}

  public getOptions(): LLMOptions {
    return this.options;
  }

  public async ask(
    prompt: string,
    systemPrompt?: string,
    promptDescription?: string,
  ): Promise<string> {
    const options: Options = {};

    if (!this.options.modelName) {
      logger.error("LLM model name is not specified.");
      throw new Error("LLM model name is required.");
    }

    options.model = this.options.modelName;

    logger.debug("Using LLM model: " + this.options.modelName);

    if (this.options.apiKey) {
      options.apiKey = this.options.apiKey;
    }

    logger.debug(
      "Using LLM API key: " + prepareApiKeyForLogs(this.options.apiKey),
    );

    options.service = this.options.service;

    if (!options.service) {
      logger.debug(
        "Service not specified, trying to determine from model name.",
      );

      const service = await ApiLLMExecutor.getServiceForModel(
        this.options.modelName,
      );

      logger.debug("Determined service: " + service);

      if (service) {
        options.service = this.options.service = service;
      }

      if (!options.service) {
        throw new Error(
          `Service provider is required for model ${this.options.modelName}.`,
        );
      }
    }

    if (this.options.llmBaseUrl) {
      options.baseUrl = this.options.llmBaseUrl;
      logger.debug("Using LLM base URL: " + options.baseUrl);
    }

    if (!options.max_tokens && options.service === "google") {
      options.max_tokens = UNLIMITED_TOKENS;
    }

    let response: any;

    try {
      const llm = LlmJsFactories.createLlm(options);

      if (systemPrompt) {
        llm.system(systemPrompt);
      }

      llm.addMessage("user", prompt);

      response = await llm.send();
    } catch (error) {
      logger.error("Error initializing LLM:", (error as Error).message);
      logger.error("Stack trace:", (error as Error).stack);
      return "";
    }

    return this.extractResponse(response);
  }

  private async extractResponse(response: any): Promise<string> {
    if (typeof response === "string") {
      logger.debug("LLM returned a string response.");
      return response;
    }

    if (Symbol.asyncIterator in Object(response)) {
      logger.debug("LLM returned a streaming response.");

      let result = "";

      for await (const chunk of response as AsyncGenerator<string>) {
        result += chunk;
      }

      return result;
    }

    if ("text" in response && typeof response.text === "function") {
      logger.debug("LLM returned a Response-like object.");

      return await response.text();
    }

    logger.debug("Returning JSON string.");

    return JSON.stringify(response);
  }

  public static async getServiceForModel(
    modelName: string,
  ): Promise<string | null> {
    return LLMServiceByModel.getServiceForModel(modelName);
  }
}
