//import { config as loadEnv } from "dotenv";
//import path from "path";
//import fs from "fs";
import LLM from "@themaximalist/llm.js";
import { Options } from "@themaximalist/llm.js";
import logger from "../utils/logger";
import { LLMServiceByModel } from "./llmUtils";
import { DEFAULT_ENV_FILE } from "../utils/constants";

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

    /*if (this.options.envFile) {
      loadEnv({ path: path.resolve(this.options.envFile) });
    } else if (fs.existsSync(path.resolve(DEFAULT_ENV_FILE))) {
      loadEnv({ path: path.resolve(DEFAULT_ENV_FILE) });
    }

    if (!this.options.apiKey && process.env.API_KEY) {
      this.options.apiKey = process.env.API_KEY;
    }

    if (!this.options.modelName && process.env.MODEL_NAME) {
      this.options.modelName = process.env.MODEL_NAME;
    }

    if (!this.options.modelName && process.env.MODEL) {
      this.options.modelName = process.env.MODEL;
    }*/
  }

  public async ask(prompt: string, systemPrompt?: string): Promise<string> {
    let options: Options = {};
    if (this.options.modelName) {
      options.model = this.options.modelName;
    }

    if (this.options.apiKey) {
      options.apiKey = this.options.apiKey;
    }

    if (!this.options.service) {
      const service = await LLMServiceByModel.getServiceForModel(
        this.options.modelName
      );
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

    let response: any;

    try {
      const llm = new LLM(options);
      if (systemPrompt) {
        llm.system(systemPrompt);
      }

      llm.addMessage("user", prompt);

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
      return response;
    }

    // If it's an async generator (stream)
    if (Symbol.asyncIterator in Object(response)) {
      let result = "";
      for await (const chunk of response as AsyncGenerator<string>) {
        result += chunk;
      }
      return result;
    }

    // If it's a Response-like object
    if ("text" in response && typeof response.text === "function") {
      return await response.text();
    }

    // Fallback
    return JSON.stringify(response);
  }

  public getOptions(): LLMOptions {
    return this.options;
  }
}
