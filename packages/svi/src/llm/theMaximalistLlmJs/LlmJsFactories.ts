import LLM from "@themaximalist/llm.js";
//import { ModelUsage } from "@themaximalist/llm.js";
import type { Options, Input } from "@themaximalist/llm.js";

export default class LlmJsFactories {
  static createLlm(input?: Input | Options, options: Options = {}) {
    let llm: InstanceType<typeof LLM>;

    if (input && typeof input === "object" && !Array.isArray(input)) {
      llm = new LLM(input as Options);
    } else if (input) {
      llm = new LLM(input as Input, options);
    } else {
      llm = new LLM();
    }

    return llm;
  }
}

/*export function createModelUsage(service?: string) {
  const modelUsage = new ModelUsage(service as any);
  return modelUsage;
}*/
