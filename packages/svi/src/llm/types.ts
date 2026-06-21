export interface LLMOptions {
  modelName: string;
  service?: string;
  apiKey?: string;
  llmBaseUrl?: string;
  envFile?: string;
  clipboardMode?: boolean;
}

export interface LLMExecutor {
  ask(
    prompt: string,
    systemPrompt?: string,
    promptDescription?: string,
  ): Promise<string>;
}
