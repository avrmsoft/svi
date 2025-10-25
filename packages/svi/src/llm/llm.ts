// src/llm/llm.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { config as loadEnv } from "dotenv";
import path from "path";

export interface LLMOptions {
  modelName: string;
  apiKey?: string;
  envFile?: string;
}

export class LLM {
  private model: BaseChatModel;

  constructor(private options: LLMOptions) {
    
    if (options.envFile) {
      loadEnv({ path: path.resolve(options.envFile) });
    }

    this.model = this.initModel(options);
  }

  private initModel(options: LLMOptions): BaseChatModel {
    const { modelName, apiKey } = options;

    if (modelName.startsWith("gpt")) {
      const key = apiKey ?? process.env.OPENAI_API_KEY;
      if (!key) throw new Error("OpenAI API Key missing!");
      return new ChatOpenAI({
        modelName,
        apiKey: key,
        temperature: 0,
      });
    }

    if (modelName.startsWith("claude")) {
      const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
      if (!key) throw new Error("Anthropic API Key missing!");
      return new ChatAnthropic({
        modelName,
        apiKey: key,
        temperature: 0,
      });
    }

    // --- Google Gemini ---
    if (modelName.startsWith("gemini")) {
      const key = apiKey ?? process.env.GOOGLE_API_KEY;
      if (!key) throw new Error("Google API Key missing!");
      return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: key,
        temperature: 0,
      });
    }

    throw new Error(`Unknown model: ${modelName}`);
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
