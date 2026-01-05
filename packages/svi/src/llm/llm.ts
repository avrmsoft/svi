//import { config as loadEnv } from "dotenv";
//import path from "path";
//import fs from "fs";
import LLM from "@themaximalist/llm.js";
import { Options } from "@themaximalist/llm.js";
import logger from "../utils/logger";
import { LLMServiceByModel } from "./llmServiceByModel";
//import { DEFAULT_ENV_FILE } from "../utils/constants";
import { prepareApiKeyForLogs, preparePromptForLogs } from "./llmUtils";
import { UNLIMITED_TOKENS } from "../utils/constants";

export interface LLMOptions {
  modelName: string;
  service?: string;
  apiKey?: string;
  envFile?: string;
}

export class LLMProcessor {
  private options: LLMOptions;

  constructor(optionsIn: LLMOptions) {
    this.options = optionsIn;
  }

  public async ask(prompt: string, systemPrompt?: string): Promise<string> {
    let options: Options = {};

    logger.debug(
      "Planning to ask LLM, prompt: " + preparePromptForLogs(prompt)
    );

    if (this.options.modelName) {
      options.model = this.options.modelName;
    }

    logger.debug("Using LLM model:" + this.options.modelName);

    if (this.options.apiKey) {
      options.apiKey = this.options.apiKey;
    }

    logger.debug(
      "Using LLM API key: " + prepareApiKeyForLogs(this.options.apiKey)
    );

    if (!this.options.service) {
      logger.debug(
        "Service not specified, trying to determine from model name."
      );

      const service = await LLMServiceByModel.getServiceForModel(
        this.options.modelName
      );

      logger.debug("Determined service: " + service);

      if (service) {
        options.service = this.options.service = service;
      }

      if (!this.options.service) {
        logger.warn(
          `Could not determine service for model ${this.options.modelName}.`
        );
        throw new Error(
          `Service provider is required for model ${this.options.modelName}. Please specify it explicitly or check model name.`
        );
      }
    }

    if (!options.max_tokens && options.service === "google") {
      options.max_tokens = UNLIMITED_TOKENS;
    }

    let response: any;

    try {
      logger.trace("Before calling LLM");
      const llm = new LLM(options);
      if (systemPrompt) {
        llm.system(systemPrompt);
      }

      llm.addMessage("user", prompt);

      logger.trace("Before calling llm.send()");
      response = await llm.send();
    } catch (error) {
      //console.error("Error initializing LLM:", (error as Error).message);
      //console.error("Stack trace:", (error as Error).stack);
      logger.error("Error initializing LLM:", (error as Error).message);
      logger.error("Stack trace:", (error as Error).stack);
      return "";
    }

    // Handle all possible types
    if (typeof response === "string") {
      logger.debug("LLM returned a string response.");
      return this.traceResultIfNeeded(response);
    }

    // If it's an async generator (stream)
    if (Symbol.asyncIterator in Object(response)) {
      logger.debug("LLM returned a streaming response (iterator).");
      let result = "";
      for await (const chunk of response as AsyncGenerator<string>) {
        result += chunk;
      }
      return this.traceResultIfNeeded(result);
    }

    // If it's a Response-like object
    if ("text" in response && typeof response.text === "function") {
      logger.debug(
        "LLM returned a Response-like object (we can use it as response.text())."
      );
      return this.traceResultIfNeeded(await response.text());
    }

    // Fallback
    logger.debug("No specific response type matched, returning JSON string.");
    return this.traceResultIfNeeded(JSON.stringify(response));
  }

  public getOptions(): LLMOptions {
    return this.options;
  }

  public traceResultIfNeeded(result: string): string {
    logger.trace(
      `LLM response, length ${result.length}: ${preparePromptForLogs(result)}`
    );
    return result;
  }
}
