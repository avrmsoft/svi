import logger from "../utils/logger";
import { LLMExecutor, LLMOptions } from "./types";
import ApiLLMExecutor from "./apiLlmExecutor";
import ManualLlmExecutor from "./manualLlmExecutor";
import { LLMServiceByModel } from "./llmServiceByModel";

export class LLMProcessor {
  private executor: LLMExecutor;
  private options: LLMOptions;

  constructor(optionsIn: LLMOptions) {
    this.options = optionsIn;

    if (optionsIn.clipboardMode) {
      this.executor = new ManualLlmExecutor(optionsIn);
    } else {
      this.executor = new ApiLLMExecutor(optionsIn);
    }
  }

  public async ask(
    prompt: string,
    systemPrompt?: string,
    promptDescription?: string,
  ): Promise<string> {
    logger.prompt(
      `Start of prompt ${promptDescription}:\n\n${prompt}\n\nEnd of prompt ${promptDescription}`,
    );

    const result = await this.executor.ask(
      prompt,
      systemPrompt,
      promptDescription,
    );

    logger.llmResponse(result);

    return result;
  }

  public getOptions(): LLMOptions {
    return this.options;
  }

  public traceResultIfNeeded(result: string): string {
    logger.llmResponse(result);
    /*logger.trace(
        `LLM response, length ${result.length}: ${preparePromptForLogs(result)}`,
      );*/
    return result;
  }

  public static async getServiceForModel(
    modelName: string,
  ): Promise<string | null> {
    return await LLMServiceByModel.getServiceForModel(modelName);
  }
}
