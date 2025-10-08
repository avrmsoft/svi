// src/llm/llm.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config as loadEnv } from "dotenv";
import path from "path";

export interface LLMOptions {
  modelName: string;
  apiKey?: string;
  envFile?: string; // optionaler Pfad zu einer .env-Datei
}

export class LLM {
  private model: BaseChatModel;

  constructor(private options: LLMOptions) {
    // ggf. .env-Datei laden
    if (options.envFile) {
      loadEnv({ path: path.resolve(options.envFile) });
    }

    // Modell auswählen
    this.model = this.initModel(options);
  }

  private initModel(options: LLMOptions): BaseChatModel {
    const { modelName, apiKey } = options;

    if (modelName.startsWith("gpt")) {
      const key = apiKey ?? process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OpenAI API Key fehlt!");
      return new ChatOpenAI({
        modelName,
        apiKey: key,
        temperature: 0,
      });
    }

    if (modelName.startsWith("claude")) {
      const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("Anthropic API Key fehlt!");
      return new ChatAnthropic({
        modelName,
        apiKey: key,
        temperature: 0,
      });
    }

    throw new Error(`Unbekanntes Modell: ${modelName}`);
  }

  async ask(prompt: string, systemPrompt?: string): Promise<string> {
    const messages = [];
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }
    messages.push(new HumanMessage(prompt));

    const res = await this.model.invoke(messages);
    return res.content.toString();
  }
}
